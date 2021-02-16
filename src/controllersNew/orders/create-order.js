import { createStoreService } from '../../services/orders/create-order'

const createOrderController = async function (req, res, next) {
    const data = req.body;

    try {
        await createStoreService(data);
    } catch (error) {
        console.log(error);
        return next({
            status: error.status,
            message: error.message
        });
    }
}