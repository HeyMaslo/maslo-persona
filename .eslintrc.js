module.exports = {
    "extends": ["airbnb-base"],
    "parser": "babel-eslint",
    "parserOptions": {
        "ecmaVersion": 8,
        "sourceType": "module",
        "ecmaFeatures": {
            "jsx": true,
            "modules": false,
            "globalReturn": false
        }
    },
    "rules": {
        "camelcase": 2,
        "indent": ["warn", 2, {
            "SwitchCase": 1
        }],
        "quotes": [2, "single"],
        "no-unused-vars": 1,
        "no-use-before-define": "warn",
        "no-console": 1,
        "no-continue": 0,
        "no-plusplus": 0,
        "no-tabs": 1,
        "no-var": 1,
        "linebreak-style": ["warn", process.platform === 'win32' ? 'windows' : "unix"],
        "lines-between-class-members": 0,
        "prefer-destructuring": 1,
        "prefer-template": 1,
        "global-require": 1,
        "import/prefer-default-export": 0,
        "no-param-reassign": 1,
        "func-names": 1,
        "prefer-arrow-callback": 1,
        "no-underscore-dangle": 1,
        "class-methods-use-this": 1,
        "no-unused-expressions": 1,
        "arrow-parens": 1,
        "nonblock-statement-body-position": 0,
        "curly": 0,
        "padded-blocks": 0,
        "no-multi-spaces": 1,
        "object-shorthand": 1,
        "comma-style": 1,
        "max-len": [1, {
            "comments": 150
        }, {
            "code": 120
        }],
        "import/no-extraneous-dependencies": ["error", {"packageDir": path.join(__dirname)}],
    },
    "env": {
        "es6": true,
        "node": true,
        "browser": true
    }
};
