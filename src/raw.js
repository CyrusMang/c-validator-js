'use strict'

export const empty = (value) => {
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
