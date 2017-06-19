'use strict'

import raw from './raw'

export class ValidateError {
    constructor(validation, name, message) {
        this.validation = validation
        this.name = name
        this.message = message
    }
    print() {
        return {
            validation: this.validation,
            field: this.name,
            message: this.message.replace('{name}', this.name || 'value')
        }
    }
}

const Validate = (schema, value, name) => {
    let errors = []
    try {
        if (typeof schema === 'string') {
            if (typeof value === 'string') {
                value = raw.sanitization.escape(value)
            }
            for (let s of schema.split('|')) {
                let _s = s.split(':')
                value = validaters[_s[0]](name, value, _s[1])
            }
        } else if (typeof schema === 'function') {
            try {
                value = schema(name, value)
            } catch (e) {
                if (Array.isArray(e)) {
                    errors = [...errors, ...e]
                } else {
                    throw e
                }
            }
        } else if (Array.isArray(schema)) {
            if (value && !Array.isArray(value)) {
                throw new ValidateError('type', name, '{name} should be an array')
            }
            if (schema[0]) {
                for (let [k, v] of value.entries()) {
                    try {
                        value[k] = Validate(schema[0], v, name ? `${name}.${k}` : k)
                    } catch (e) {
                        if (Array.isArray(e)) {
                            errors = [...errors, ...e]
                        } else {
                            throw e
                        }
                    }
                }
            }
        } else if (typeof schema === 'object') {
            if (value && typeof value !== 'object') {
                throw new ValidateError('type', name, '{name} should be an object')
            }
            for (let [k, s] of Object.entries(schema)) {
                try {
                    value[k] = Validate(s, value[k], name ? `${name}.${k}` : k)
                } catch (e) {
                    if (Array.isArray(e)) {
                        errors = [...errors, ...e]
                    } else {
                        throw e
                    }
                }
            }
        } else {
            throw Error('Schema syntax error')
        }
        if (!errors.length) {
            return value
        }
    } catch (e) {
        if (e instanceof ValidateError) {
            errors.push(e)
        } else {
            throw e
        }
    }
    throw errors
}
export default Validate

const validaters = {
    required: (name, value) => {
        if (raw.validation.empty(value)) {
            throw new ValidateError('required', name, '{name} is required')
        }
        return value
    },
    in: (name, value, args) => {
        args = typeof args === 'string' ? args.split(',') : (args || [])
        if (!raw.validation.empty(value)) {
            if (!raw.validation.in(value, args)) {
                throw new ValidateError('in', name, '{name} not in option')
            }
        }
        return value
    },
    regex: (name, value, args) => {
        if (!raw.validation.empty(value)) {
            if (!raw.validation.regex(value, args)) {
                throw new ValidateError('regex', name, '{name} not valid')
            }
        }
        return value
    },
    slug: (name, value) => {
        if (!raw.validation.empty(value)) {
            if (typeof value == 'string') {
                value = raw.sanitization.slug(value)
                if (value) {
                    return value
                }
            }
            throw new ValidateError('slug', name, '{name} not valid slug')
        }
        return value
    },
    email: (name, value) => {
        if (!raw.validation.empty(value)) {
            if (typeof value !== 'string' || !raw.validation.is_email(value)) {
                throw new ValidateError('email', name, '{name} not valid email')
            }
        }
        return value
    },
    integer: (name, value) => {
        if (!raw.validation.empty(value)) {
            if (typeof value !== 'string' || !raw.validation.is_integer(value)) {
                throw new ValidateError('integer', name, '{name} not valid integer')
            }
        }
        return value
    }
}