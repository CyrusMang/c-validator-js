const ValidationError = require('./error')
const raw = require('./raw')

const validaters = {
    required: (name, value) => {
        if (raw.validation.empty(value)) {
            throw new ValidationError('required', name, '{name} is required')
        }
        return value
    },
    in: (name, value, args) => {
        args = typeof args === 'string' ? args.split(',') : (args || [])
        if (!raw.validation.empty(value)) {
            if (!raw.validation.in(value, args)) {
                throw new ValidationError('in', name, '{name} not in option')
            }
        }
        return value
    },
    regex: (name, value, args) => {
        if (!raw.validation.empty(value)) {
            if (!raw.validation.regex(value, args)) {
                throw new ValidationError('regex', name, '{name} not valid')
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
            throw new ValidationError('slug', name, '{name} not valid slug')
        }
        return value
    },
    phone: (name, value) => {
        if (!raw.validation.empty(value)) {
            if (typeof value !== 'string' || !raw.validation.isPhone(value)) {
                throw new ValidationError('phone', name, '{name} not valid phone')
            }
        }
        return value
    },
    email: (name, value) => {
        if (!raw.validation.empty(value)) {
            if (typeof value !== 'string' || !raw.validation.isEmail(value)) {
                throw new ValidationError('email', name, '{name} not valid email')
            }
        }
        return value
    },
    integer: (name, value) => {
        if (!raw.validation.empty(value)) {
            if (typeof value !== 'string' || !raw.validation.isInteger(value)) {
                throw new ValidationError('integer', name, '{name} not valid integer')
            }
        }
        return value
    }
}

const Validate = (schema, value, name) => {
    let errors = []
    if (typeof schema === 'string') {
        if (typeof value === 'string') {
            value = raw.sanitization.escape(value)
        }
        if (schema) {
            for (let s of schema.split('|')) {
                let n = s.split(':')
                try {
                    value = validaters[n[0]](name, value, n[1])
                } catch (e) {
                    if (e instanceof ValidationError) {
                        errors.push(e)
                    } else {
                        throw e
                    }
                }
            }
        }
    } else if (typeof schema === 'function') {
        const [v, e] = schema(name, value)
        if (e) {
            errors = [...errors, ...e]
        }
        value = v
    } else if (Array.isArray(schema)) {
        if (value && !Array.isArray(value)) {
            errors.push(new ValidationError('type', name, '{name} should be an array'))
        } else if (schema[0]) {
            value = value.map((_v, i) => {
                const [v, e] = Validate(schema[0], _v, name ? `${name}.${i}` : i)
                if (e) {
                    errors = [...errors, ...e]
                }
                return v
            })
        }
    } else if (typeof schema === 'object') {
        if (value && typeof value !== 'object') {
            errors.push(ValidationError('type', name, '{name} should be an object'))
        }
        let data = {}
        for (let [k, s] of Object.entries(schema)) {
            let [v, e] = Validate(s, value[k], name ? `${name}.${k}` : k)
            if (e) {
                errors = [...errors, ...e]
            }
            data[k] = v
        }
        value = data
    } else {
        throw Error('Schema syntax error')
    }
    return [value, errors.length ? errors : null]
}

module.exports = Validate