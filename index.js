const raw = require('./raw')

const validaters = {
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
  integer: (path, value) => {
    let errors = []
    if (!raw.validation.empty(value)) {
      if (typeof value !== 'string' || !raw.validation.isInteger(value)) {
        errors.push({
          path,
          message: '{name} not valid integer',
        })
      }
    }
    return [value, errors]
  }
}

const Validate = async (schema, value, path) => {
  if (typeof schema === 'string') {
    schema = {
      _type: 'string',
      condition: schema
    }
  } else if (Array.isArray(schema)) {
    schema = {
      _type: 'list',
      item: schema.length ? schema[0] : '',
    }
  } else if (typeof schema === 'object' && !schema._type) {
    schema = {
      _type: 'dist',
      schema: schema,
    }
  } else if (typeof schema === 'function') {
    schema = {
      _type: 'custom',
      validation: schema,
    }
  }
  
  if (typeof schema !== 'object' || !schema._type) {
    throw new Error('Schema syntax error')
  }

  let errors = []
  switch (schema._type) {
    case 'string':
      if (schema.condition) {
        for (let s of schema.condition.split('|')) {
          let n = s.split(':')
          let [v, _errors] = validaters[n[0]](path, value, n[1])
          if (_errors) {
            errors = [...errors, ..._errors]
          }
          value = v
        }
      }
      break
    case 'list':
      if (!Array.isArray(value)) {
        errors.push({
          path, message: '{name} should be a list'
        })
        break
      }
      if (schema.condition) {
        for (let s of schema.condition.split('|')) {
          let n = s.split(':')
          let [v, _errors] = validaters[n[0]](path, value, n[1])
          if (_errors) {
            errors = [...errors, ..._errors]
          }
          value = v
        }
      }
      let list = []
      try {
        for (let [i, _value] of value.entries()) {
          let [v, _errors] = await Validate(schema.item, _value, path ? `${path}.${i}` : i)
          if (_errors) {
            errors = [...errors, ..._errors]
          }
          list.push(v)
        }
      } catch (e) {
        throw e
      }
      value = list
      break
    case 'dist':
      if (typeof value !== 'object') {
        errors.push({
          path, message: '{name} is invalid'
        })
        break
      }
      if (schema.condition) {
        for (let s of schema.condition.split('|')) {
          let n = s.split(':')
          let [v, _errors] = validaters[n[0]](path, value, n[1])
          if (_errors) {
            errors = [...errors, ..._errors]
          }
          value = v
        }
      }
      let dist = {}
      try {
        for (let [k, s] of Object.entries(schema.schema)) {
          let [v, _errors] = await Validate(s, value[k], path ? `${path}.${k}` : k)
          if (_errors) {
            errors = [...errors, ..._errors]
          }
          dist[k] = v
        }
      } catch (e) {
        throw e
      }
      value = dist
      break
    case 'custom':
      try {
        let [v, _errors] = await schema.validation(path, value)
        if (_errors) {
          errors = [...errors, ..._errors]
        }
        value = v
      } catch (e) {
        throw e
      }
      break
  }
  return [value, errors]
}

module.exports = Validate