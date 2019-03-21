const base = require('../.eslintrc.js');

module.exports = {
    ...base,
    "plugins": ["import"],
    "settings": {
        "import/resolver": "webpack"
    }
};
