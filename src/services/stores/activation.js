import { checkProfileComplete } from '../../utils/checkActivation'

import {
    getMongoStoresCollection
} from '../mongodb/collections'

export { setProfileComplete }

function setProfileComplete(store) {
    const collectionStores = await getMongoStoresCollection();
    
    if (checkProfileComplete) return true
}
