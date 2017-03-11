'use strict'

const validation = {}

validation.empty = (value) => {
    if (value === null || value === undefined) {
        return true
    }
    switch(typeof value) {
        case 'string':
        case 'array':
            return value.length === 0
        case 'object':
            return Object.keys(value).length === 0
    }
}
validation.in = (value, args) => args.includes(value)
validation.regex = (value, re) => new RegExp(re).test(value)
validation.is_phone = (value) => /^\d+$/.test(value)
validation.is_email = (value) => {
    const re = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_\`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+(?:[A-Z]{2}|com|org|net|gov|mil|biz|info|mobi|name|aero|jobs|museum)\b/
    return re.test(value)
}

const sanitization = {}

sanitization.slug = (v) => v.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '')
sanitization.escape = value => (value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\//g, '&#x2F;')
    .replace(/\\/g, '&#x5C;')
    .replace(/`/g, '&#96;')
)

export default {validation, sanitization}