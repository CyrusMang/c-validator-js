# c-validator-js
Validating and sanitizing data

    import Validator, {ValidateError} from 'c-validator-js'
    
    const valid = (data) => {
        const schema = {
            name: 'required',
            slug: 'required|slug',
            contact: {
                email: 'required'
            }
        }
        try {
            Validator(schema, data)
        } catch(e) {
            if (e instanceof ValidateError) {
                console.error(e)
                return false
            }
            throw e
        }
        return true
    }
    
    // true
    console.log(valid({
        name: 'Test',
        slug: 'name-test',
        contact: {
            email: 'test@testing.com'
        }
    }))
    
    // false
    console.log(valid({
        slug: 'name-test',
        contact: 'not valid'
    }))
