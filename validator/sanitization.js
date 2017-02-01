'use strict'

export const slug = (v) => v.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '')

export const escape = value => (value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\//g, '&#x2F;')
    .replace(/\\/g, '&#x5C;')
    .replace(/`/g, '&#96;')
)