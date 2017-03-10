'use strict'

import Validate, {validate, ValidateError} from '../'
import * as raw from '../raw'
import validation from '../validation'

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
                        return value
                    }
                }
            }
            test('should return a list of errors when value not match with schema', () => {
                const value = {
                    name: 'Test',
                    slug: '',
                    contact: {
                        email: 'testtesting.com',
                        phote: '62372424'
                    }
                }
                try {
                    Validate(schema, value)
                } catch(e) {
                    return expect(e).toEqual([
                        ['slug', {
                            message: '{name} is required', 
                            validation: 'required'
                        }], 
                        ['contact.phone', {
                            message: "{name} is required", 
                            validation: "required"
                        }]
                    ])
                }
                throw Error('validation should not be pass')
            })
            test('should return true when value match with schema', () => {
                const value = {
                    name: 'Test',
                    slug: 'name-test',
                    contact: {
                        email: 'test@testing.com',
                        phone: ['62372424']
                    }
                }
                expect(Validate(schema, value)).toEqual({
                    name: 'Test',
                    slug: 'name-test',
                    contact: {
                        email: 'test@testing.com',
                        phone: ['62372424']
                    }
                })
            })
        })
    })
    describe('validation', () => {
        describe('required', () => {
            test('should return ValidateError when value = null', () => {
                try {
                    validation.required(null)
                } catch(e) {
                    return expect(e).toEqual({
                        message: '{name} is required', 
                        validation: 'required'
                    })
                }
                throw Error('validation should not be pass')
            })
            test('should return ValidateError when value = []', () => {
                try {
                    validation.required([])
                } catch(e) {
                    return expect(e).toEqual({
                        message: '{name} is required', 
                        validation: 'required'
                    })
                }
                throw Error('validation should not be pass')
            })
            test('should return ValidateError when value = {}', () => {
                try {
                    validation.required({})
                } catch(e) {
                    return expect(e).toEqual({
                        message: '{name} is required', 
                        validation: 'required'
                    })
                }
                throw Error('validation should not be pass')
            })
            test('should return true when value = `not empty`', () => {
                expect(validation.required('not empty')).not.toThrow(ValidateError)
            })
        })
        describe('in', () => {
            test('should return ValidateError when value not in [`a`, `b`, `c`]', () => {
                try {
                    validation.in('d', [])
                } catch(e) {
                    return expect(e).toEqual({
                        message: '{name} not in option', 
                        validation: 'in'
                    })
                }
                throw Error('validation should not be pass')
            })
            test('should return true when value in [`a`, `b`, `c`]', () => {
                expect(validation.in('a', ['a','b','c'])).not.toThrow(ValidateError)
                expect(validation.in('b', ['a','b','c'])).not.toThrow(ValidateError)
                expect(validation.in('c', ['a','b','c'])).not.toThrow(ValidateError)
            })
        })
        describe('slug', () => {
            test('should return ValidateError when value = []', () => {
                try {
                    validation.slug(['test'])
                } catch(e) {
                    return expect(e).toEqual({
                        message: '{name} not valid slug', 
                        validation: 'slug'
                    })
                }
                throw Error('validation should not be pass')
            })
            test('should return true when value = `Test slug`', () => {
                expect(validation.slug('Test slug')).toEqual('test-slug')
            })
        })
        describe('email', () => {
            test('should return ValidateError when value = []', () => {
                try {
                    validation.email('test')
                } catch(e) {
                    return expect(e).toEqual({
                        message: '{name} not valid email', 
                        validation: 'email'
                    })
                }
                throw Error('validation should not be pass')
            })
            test('should return true when value = `test@test.com`', () => {
                expect(validation.email('test@test.com')).toEqual('test@test.com')
            })
        })
        describe('phone', () => {
            test('should return ValidateError when value = []', () => {
                try {
                    validation.phone('test')
                } catch(e) {
                    return expect(e).toEqual({
                        message: '{name} not valid phone', 
                        validation: 'phone'
                    })
                }
                throw Error('validation should not be pass')
            })
            test('should return true when value = `92321424`', () => {
                expect(validation.phone(92321424)).toEqual(92321424)
            })
        })
    })
})