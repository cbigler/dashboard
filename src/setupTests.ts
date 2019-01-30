import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

// Required for async/await to work in tests
import regeneratorRuntime from "regenerator-runtime";
global.regeneratorRuntime = regeneratorRuntime;

configure({ adapter: new Adapter() });
