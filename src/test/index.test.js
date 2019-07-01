'use strict';

import Validate, { ValidationError } from '../'
import raw from '../raw'

describe('validator', () => {
    describe('main', () => {
        describe('schema', () => {
            const schema = {
                name: 'required',
                slug: 'required|slug',
                contact: {
                    email: 'required|email',
                    phone: (name, value) => {
                        let errors = []
                        if (!Array.isArray(value)) {
                            errors.push(new ValidationError('phone', name, '{name} not valid phone list'))
                        } else if (raw.validation.empty(value)) {
                            errors.push(new ValidationError('required', name, '{name} is required'))
                        } else {
                            for (let [k, v] of value.entries()) {
                                if (raw.validation.empty(v)) {
                                    errors.push(new ValidationError('required', `${name}.${k}`, '{name} is required'))
                                }
                            }
                        }
                        return [value, errors]
                    }
                }
            }
            test('should return a list of errors when value not match with schema', () => {
                const data = {
                    name: 'Test',
                    slug: '',
                    contact: {
                        email: 'testtesting.com',
                        phote: '62372424'
                    }
                }
                const [value, errors] = Validate(schema, data)
                return expect(errors.map(v => v.details)).toEqual([
                    {
                        path: 'slug',
                        message: '{name} is required', 
                        validation: 'required'
                    },
                    {
                        path: 'contact.email',
                        message: '{name} not valid email', 
                        validation: 'email'
                    },
                    {
                        path: 'contact.phone',
                        message: '{name} not valid phone list', 
                        validation: 'phone'
                    }
                ])
            })
            test('should return true when value match with schema', () => {
                const data = {
                    name: 'Test',
                    slug: 'name-test',
                    contact: {
                        email: 'test@testing.com',
                        phone: ['62372424']
                    }
                }
                const [value, errors] = Validate(schema, data)
                expect(value).toEqual({
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
            test('should return true when value = null', () => {
                expect(raw.validation.empty(null)).toEqual(true)
            })
            test('should return true when value = []', () => {
                expect(raw.validation.empty([])).toEqual(true)
            })
            test('should return true when value = {}', () => {
                expect(raw.validation.empty({})).toEqual(true)
            })
            test('should return false when value = `not empty`', () => {
                expect(raw.validation.empty('not empty')).toEqual(false)
            })
        })
        describe('in', () => {
            test('should return false when value not in [`a`, `b`, `c`]', () => {
                expect(raw.validation.in('d', [])).toEqual(false)
            })
            test('should return true when value in [`a`, `b`, `c`]', () => {
                expect(raw.validation.in('a', ['a','b','c'])).toEqual(true)
                expect(raw.validation.in('b', ['a','b','c'])).toEqual(true)
                expect(raw.validation.in('c', ['a','b','c'])).toEqual(true)
            })
        })
        describe('phone', () => {
            test('should return false when value = `test`', () => {
                expect(raw.validation.isPhone('test')).toEqual(false)
            })
            test('should return true when value = `+12398930343`', () => {
                expect(raw.validation.isPhone('+12398930343')).toEqual(true)
            })
        })
        describe('email', () => {
            test('should return false when value = `test`', () => {
                expect(raw.validation.isEmail('test')).toEqual(false)
            })
            test('should return true when value = `test@test.com`', () => {
                expect(raw.validation.isEmail('test@test.com')).toEqual(true)
            })
        })
        describe('is_integer', () => {
            test('should return false when value = `test`', () => {
                expect(raw.validation.isInteger('test')).toEqual(false)
            })
            test('should return true when value = `92321424`', () => {
                expect(raw.validation.isInteger('92321424')).toEqual(true)
            })
        })
    })
})