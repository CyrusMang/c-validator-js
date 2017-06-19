'use strict'

import Validate, {ValidateError} from '../'
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
                        if (!Array.isArray(value)) {
                            throw new ValidateError('phone', name, '{name} not valid phone list')
                        }
                        if (raw.validation.empty(value)) {
                            throw new ValidateError('required', name, '{name} is required')
                        }
                        let errors = []
                        for (let [k, v] of value.entries()) {
                            if (raw.validation.empty(v)) {
                                errors.push(new ValidateError('required', `${name}.${k}`, '{name} is required'))
                            }
                        }
                        if (errors.length) {
                            throw errors
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
                    if (Array.isArray(e)) {
                        return expect(e.map(v => v.print())).toEqual([
                            {
                                field: 'slug',
                                message: 'slug is required', 
                                validation: 'required'
                            },
                            {
                                field: 'contact.email',
                                message: 'contact.email not valid email', 
                                validation: 'email'
                            },
                            {
                                field: 'contact.phone',
                                message: 'contact.phone not valid phone list', 
                                validation: 'phone'
                            }
                        ])
                    }
                }
                throw new Error('failure')
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
        describe('email', () => {
            test('should return false when value = []', () => {
                expect(raw.validation.is_email('test')).toEqual(false)
            })
            test('should return true when value = `test@test.com`', () => {
                expect(raw.validation.is_email('test@test.com')).toEqual(true)
            })
        })
        describe('is_integer', () => {
            test('should return false when value = []', () => {
                expect(raw.validation.is_integer('test')).toEqual(false)
            })
            test('should return true when value = `92321424`', () => {
                expect(raw.validation.is_integer('92321424')).toEqual(true)
            })
        })
    })
})