const moment = require('moment')
const raw = require('./raw')

const operators = {
  required: (path, value) => {
    let errors = []
    if (raw.validation.empty(value)) {
      errors.push({
        path,
        message: '{name} is required',
      })
    }
    return [value, errors]
  },
  in: (path, value, args) => {
    let errors = []
    args = typeof args === 'string' ? args.split(',') : (args || [])
    if (!raw.validation.empty(value)) {
      if (!raw.validation.in(value, args)) {
        errors.push({
          path,
          message: '{name} not in option',
        })
      }
    }
    return [value, errors]
  },
  slug: (path, value) => {
    let errors = []
    if (!raw.validation.empty(value)) {
      if (typeof value !== 'string') {
        errors.push({
          path,
          message: '{name} mush be string',
        })
      } else {
        value = raw.sanitization.slug(value)
      }
    }
    return [value, errors]
  },
  phone: (path, value) => {
    let errors = []
    if (!raw.validation.empty(value)) {
      if (typeof value !== 'string' || !raw.validation.isPhone(value)) {
        errors.push({
          path,
          message: '{name} not valid phone',
        })
      }
    }
    return [value, errors]
  },
  email: (path, value) => {
    let errors = []
    if (!raw.validation.empty(value)) {
      if (typeof value !== 'string' || !raw.validation.isEmail(value)) {
        errors.push({
          path,
          message: '{name} not valid email',
        })
      }
    }
    return [value, errors]
  },
  datetime: (path, value, args) => {
    let errors = []
    if (!raw.validation.empty(value)) {
      const datetime = moment(value, args, true)
      if (datetime.isValid()) {
        value = datetime.format(args)
      } else {
        errors.push({
          path,
          message: '{name} not valid datetime',
        })
      }
    }
    return [value, errors]
  },
  integer: (_, value) => [raw.sanitization.toInteger(value), []],
  float: (_, value) => [raw.sanitization.toFloat(value), []],
  boolean: (_, value) => [raw.sanitization.toBoolean(value), []],
}

module.exports = operators