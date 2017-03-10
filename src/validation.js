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
    args = typeof args === 'string' ? args.split(',') : (args || [])
    if (!raw.empty(value)) {
        if (!args.includes(value)) {
            throw new ValidateError('in', '{name} not in option')
        }
    }
    return value
}

validation.regex = (value, re) => {
    if (!raw.empty(value)) {
        if (!new RegExp(re).test(value)) {
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

validation.phone = (value) => {
    if (!raw.empty(value)) {
        if (/^\d+$/.test(value)) {
            return value
        }
        throw new ValidateError('phone', '{name} not valid phone')
    }
    return value
}

validation.email = (value) => {
    if (!raw.empty(value)) {
        if (typeof value == 'string') {
            value = sanitization.escape(value)
            const re = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+(?:[A-Z]{2}|com|org|net|gov|mil|biz|info|mobi|name|aero|jobs|museum)\b/
            if (re.test(value)) {
                return value
            }
        }
        throw new ValidateError('email', '{name} not valid email')
    }
    return value
}

export default validation
