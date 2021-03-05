module.exports = {
    "env": {
        "browser": true,
        "es6": true,
        "node": true
    },
    "extends": [
        "eslint:recommended",
        "plugin:react/recommended",
        "prettier",
    ],
    "globals": {
        "Atomics": "readonly",
        "SharedArrayBuffer": "readonly",
        "React": "readonly",
    },
    "parserOptions": {
        "ecmaFeatures": {
            "jsx": true
        },
        "ecmaVersion": 2020,
        "sourceType": "module"
    },
    "plugins": [
        "react"
    ],
    "rules": {
        // not having to import 'React' in every file to use jsx (next does that)
        "react/react-in-jsx-scope": "off",
        // don't require components to define prop types
        "react/prop-types": "off",
        // don't require components to have a display name
        "react/display-name": "off",
        // allows to use globals like 'React' in jsx
        "react/jsx-no-undef": ["error",
            {
                "allowGlobals": true,
            }
        ],
    }
};