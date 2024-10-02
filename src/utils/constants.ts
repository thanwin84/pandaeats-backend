const dbName="food-ordering"

const statusCodes = {
    OK: 200,
    CREATED: 201, // Resource created successfully
    ACCEPTED: 202, // Request accepted for processing
    NO_CONTENT: 204, // No response body required
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401, // Authentication required or failed
    FORBIDDEN: 403, // Permission denied
    NOT_FOUND: 404,
    METHOD_NOT_ALLOWED: 405, // Request method not allowed
    CONFLICT: 409, // Conflict with the current state of the target resource
    PRECONDITION_FAILED: 412, // Precondition failed
    INTERNAL_SERVER_ERROR: 500,
    NOT_IMPLEMENTED: 501, // Server does not support the functionality
}
const restaurant = {
    USER: "user",
    RESTAURANT_NAME: 'restaurantName',
    CITY: 'city',
    COUNTRY: 'country',
    DELIVERY_PRICE: 'deliveryPrice',
    ESTIMATED_DELIVERY_TIME: 'estimatedDeliveryTime',
    CUISINES: 'cuisines',
    MENU_ITEM: 'menuItem',
    IMAGE_URL: 'imageURL'
}

const orderStatus = ['placed', "paid", "inProgress", "delivered", "outForDelivery"]

export {
    dbName,
    statusCodes,
    restaurant,
    orderStatus
}