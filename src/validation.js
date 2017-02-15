'use strict'

import * as raw from './raw'
import * as sanitization from './sanitization'
import {ValidateError} from './index'

const validation = {}

validation.required = (value) => {
    if (raw.empty(value)) {
        throw new ValidateError('required', '{name} is required')
    }
    return value
}

validation.in = (value, args) => {
    if (!raw.empty(value)) {
        if (!args.includes(value)) {
            throw new ValidateError('in', '{name} not in option')
        }
    }
    return value
}

validation.regex = (value, re) => {
    if (!raw.empty(value)) {
        if (!new RegExp(re[0]).test(value)) {
            throw new ValidateError('regex', '{name} not valid')
        }
    }
    return value
}

validation.slug = (value) => {
    if (!raw.empty(value)) {
        if (typeof value == 'string') {
            value = sanitization.slug(value)
            if (value) {
                return value
            }
        }
        throw new ValidateError('slug', '{name} not valid slug')
    }
    return value
}

export default validation
