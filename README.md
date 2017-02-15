# c-validator-js
Validating and sanitizing data

    import Validate from 'c-validator-js'
    
    const v = (data) => {
        const schema = {
            name: 'required',
            slug: 'required|slug',
            contact: {
                email: 'required'
            }
        }
        try {
            Validate(schema, data)
        } catch(e) {
            if (Array.isArray(e)) {
                console.error(e)
                return false
            }
            throw e
        }
        return true
    }
    
    // true
    console.log(v({
        name: 'Test',
        slug: 'name-test',
        contact: {
            email: 'test@testing.com'
        }
    }))
    
    // false
    console.log(v({
        slug: 'name-test',
        contact: 'not valid'
    }))
