'use strict'

import validation from './validation'
import * as sanitization from './sanitization'

export validation
export sanitization

export class ValidateError {
    constructor(v, message) {
        this.validation = v
        this.message = message
    }
    print() {
        return {
            validation: this.validation,
            message: this.message
        }
    }
}

export const validate = (n, s, _value) => {
    if (typeof s === 'string') {
        try {
            _value = _value && escape(_value)
            for (let v of s.split('|')) {
                _value = validation[v](_value)
            }
        } catch(e) {
            throw e instanceof ValidateError ? [n, e] : e
        }
    } else if (typeof s === 'function') {
        _value = s(n, _value)
    } else if (Array.isArray(s)) {
        _value = _value || []
        if (!Array.isArray(_value)) {
            throw [n, new ValidateError('type', '{name} input should be an array')]
        }
        if (s[0]) {
            for (let [k, __value] of _value.entries()) {
                _value[k] = validate(`${n}.${k}`, s[0], __value)
            }
        }
    } else if (typeof s === 'object') {
        if (_value && typeof _value !== 'object') {
            throw [n, new ValidateError('type', '{name} input should be an object')]
        }
        for (let [k, _s] of Object.entries(s)) {
            _value[k] = validate(`${n}.${k}`, _s, _value ? _value[k] : null)
        }
    } else {
        throw Error('Schema syntax error')
    }
    return _value
}

export default (schema, value) => {
    let errors = []
    for (let [name, rule] of Object.entries(schema)) {
        try {
            value[name] = validate(name, rule, value ? value[name] : null)
        } catch(e) {
            if (Array.isArray(e)) {
                errors.push(e)
            } else {
                throw e
            }
        }
    }
    if (errors.length) {
        throw errors
    }
    return value
}
