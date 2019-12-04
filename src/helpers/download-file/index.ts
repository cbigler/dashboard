export function downloadFile(fileName: string, content: string, contentType: string) {
  // This is a workaround to allow a user to download data, or if that doesn't work,
  // then at least open it in a new tab for them to view and copy to the clipboard.
  // 1. Create a new blob url.
  // 2a. Redirect the user to it in a new tab.
  // 2b. Except on IE where we use a .msSaveBlob() function
  const dataBlob = new Blob([content], { type: contentType });

  if (navigator && navigator.msSaveBlob) { // IE 10+
    navigator.msSaveBlob(dataBlob, fileName);
  } else {
    const dataURL = URL.createObjectURL(dataBlob);
    const tempLink = document.createElement('a');
    document.body.appendChild(tempLink);
    tempLink.href = dataURL;
    tempLink.setAttribute('download', fileName);
    tempLink.click();
    document.body.removeChild(tempLink);
  }
}
