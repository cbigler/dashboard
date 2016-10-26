import boto3
import botocore
import sys

deploy_env = sys.argv[1]
if deploy_env not in ['staging', 'production']:
    sys.exit()

application_name = "Web-Dashboard"
region = "us-east-1"
hosted_zone_name = "density.io" if deploy_env == "production" else "density.rodeo"
subdomain_name = "dashboard.density.io" if deploy_env == "production" else "dashboard.density.rodeo"
index_document = "index.html"
error_document = "404.html"
stack_name = "%s-%s" % (application_name, deploy_env.capitalize())
stack_template = open('stack.template', 'r')

# ssl certificate arn
acm = boto3.client('acm', region_name=region)
ssl_crt = "*.%s" % hosted_zone_name
certificates = acm.list_certificates()['CertificateSummaryList']
star_certificate = filter(lambda cert: cert['DomainName'] == ssl_crt, certificates)[0]
star_certificate_arn = star_certificate['CertificateArn']

# build stack
cloudformation = boto3.client('cloudformation', region_name=region)
try:
    create_or_update_stack = "create_stack"
    try:
        cloudformation.describe_stacks(StackName=stack_name)
        create_or_update_stack = "update_stack"
    except Exception as e:
        pass

    getattr(cloudformation, create_or_update_stack)(
        StackName=stack_name,
        TemplateBody=stack_template.read(),
        Parameters=[
            {
                'ParameterKey': 'HostedZoneName',
                'ParameterValue': hosted_zone_name,
                'UsePreviousValue': False
            },
            {
                'ParameterKey': 'AWSRegion',
                'ParameterValue': region,
                'UsePreviousValue': False
            },
            {
                'ParameterKey': 'SSLCertificateARN',
                'ParameterValue': star_certificate_arn,
                'UsePreviousValue': False
            },
            {
                'ParameterKey': 'SubdomainName',
                'ParameterValue': subdomain_name,
                'UsePreviousValue': False
            },
            {
                'ParameterKey': 'IndexDocument',
                'ParameterValue': index_document,
                'UsePreviousValue': False
            },
            {
                'ParameterKey': 'ErrorDocument',
                'ParameterValue': error_document,
                'UsePreviousValue': False
            }
        ],
        Capabilities=[
            'CAPABILITY_IAM',
        ]
    )
except botocore.exceptions.ClientError as e:
    if e.response['Error']['Message'] == "No updates are to be performed.":
        print e.response['Error']['Message']
    else:
        raise
else:
    pass
