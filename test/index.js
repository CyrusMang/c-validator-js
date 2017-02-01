'use strict'

import assert from 'assert'
import * as raw from '../../helpers/validator/raw'
import Validator, {validate} from '../../helpers/validator'
import validation, {ValidateError} from '../../helpers/validator/validation'
import {multilingual, article} from '../../helpers/validator/plugin'

describe('validator', () => {
    describe('main', () => {
        describe('schema', () => {
            const schema = {
                name: 'required',
                slug: 'required|slug',
                contact: {
                    email: 'required',
                    phone: (name, value) => {
                        if (!Array.isArray(value) || raw.empty(value)) {
                            throw [name, new ValidateError('required', '{name} is required')]
                        }
                        for (let [k, _value] of value.entries()) {
                            value[k] = validate(`${name}.${k}`, 'required', _value)
                        }
                    }
                }
            }
            it('should return a list of errors when value not match with schema', () => {
                const value = {
                    name: 'Test',
                    slug: '',
                    contact: {
                        email: 'testtesting.com',
                        phote: '62372424'
                    }
                }
                try {
                    Validator(schema, value)
                } catch(e) {
                    return Array.isArray(e)
                }
            })
            it('should return true when value match with schema', () => {
                const value = {
                    name: 'Test',
                    slug: 'name-test',
                    contact: {
                        email: 'test@testing.com',
                        phone: ['62372424']
                    }
                }
                return Boolean(Validator(schema, value))
            })
        })
    })
    describe('plugin', () => {
        describe('multilingual', () => {
            const schema = {
                display: multilingual({
                    name: 'required'
                })
            }
            it('should return a list of errors when value not multilingual data', () => {
                const value = {
                    display: {
                        ewegweg: {
                            name: 'testing'
                        }
                    }
                }
                try {
                    Validator(schema, value)
                } catch(e) {
                    return Array.isArray(e)
                }
            })
            it('should return true when value is multilingual data', () => {
                const value = {
                    display: {
                        en: {
                            name: 'testing'
                        }
                    }
                }
                return Boolean(Validator(schema, value))
            })
        })
        describe('article', () => {
            const schema = {
                article: article('required')
            }
            it('should return a list of errors when value not article data', () => {
                const value = {
                    article: [
                        ['test', 'About']
                    ]
                }
                try {
                    Validator(schema, value)
                } catch(e) {
                    return Array.isArray(e)
                }
            })
            it('should return true when value is article data', () => {
                const value = {
                    article: [
                        ['h1', 'About'],
                        ['p', 'text']
                    ]
                }
                return Boolean(Validator(schema, value))
            })
        })
    })
    describe('validation', () => {
        describe('required', () => {
            it('should return ValidateError when value = null', () => {
                try {
                    validation.required(null)
                } catch(e) {
                    return e instanceof ValidateError
                }
            })
            it('should return ValidateError when value = []', () => {
                try {
                    validation.required([])
                } catch(e) {
                    return e instanceof ValidateError
                }
            })
            it('should return ValidateError when value = {}', () => {
                try {
                    validation.required({})
                } catch(e) {
                    return e instanceof ValidateError
                }
            })
            it('should return true when value = `not empty`', () => {
                try {
                    validation.required('not empty')
                } catch(e) {
                    if (e instanceof ValidateError) {
                        return false
                    }
                }
                return true
            })
        })
        describe('in', () => {
            it('should return ValidateError when value not in [`a`, `b`, `c`]', () => {
                try {
                    validation.in('d')
                } catch(e) {
                    return e instanceof ValidateError
                }
            })
            it('should return true when value in [`a`, `b`, `c`]', () => {
                try {
                    validation.in('a')
                    validation.in('b')
                    validation.in('c')
                } catch(e) {
                    if (e instanceof ValidateError) {
                        return false
                    }
                }
                return true
            })
        })
        describe('slug', () => {
            it('should return ValidateError when value = []', () => {
                try {
                    validation.slug([])
                } catch(e) {
                    return e instanceof ValidateError
                }
            })
            it('should return true when value = `Test slug`', () => {
                try {
                    return validation.slug('Test slug') === 'test-slug'
                } catch(e) {
                    if (e instanceof ValidateError) {
                        return false
                    }
                }
            })
        })
    })
})