export const ok = (body) => {
    return {
        sucess: true,
        statusCode: 200,
        body: body
    }
}

export const notFound = () => {
    return {
        sucess: false,
        statusCode: 400,
        body: 'not found'
    }

}

export const serverError = (body) => {
     return {
        sucess: false,
        statusCode: 400,
        body: error
    }

}