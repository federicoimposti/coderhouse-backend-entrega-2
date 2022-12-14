import admin from 'firebase-admin';
import serviceAccount from "../../config/coderhouse-backend-9402e-firebase-adminsdk-xcfso-e44f574149.js";

const error = { error: 'Producto no encontrado' };

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

console.log("Successful database connection");

const db = admin.firestore();

class firebaseProductsController {
    constructor(collection) {
        this.query = db.collection(collection);
    }

    async save(obj) {
        try {
            obj.timestamp = Date.now();
            const dataToSave = await this.query.add(obj);
            return {...obj, id: dataToSave.id};
        } catch (err) {
            throw new Error('Ocurrió un error al guardar el archivo.', err);
        }
    }

    async getById(id) {
        try {
            const idFormatted = id.toString();
            const itemSnapshot = await this.query.where('codigo', '==', idFormatted).get();

            const item = [];

            itemSnapshot.forEach(doc => {
                item.push({id: doc.id, ...doc.data()});
            })

            if (!item || !item.length) {
                return error;
            }

            return item ? item : error;
        } catch (err) {
            throw new Error('Ocrrió un error obteniendo el producto.', err);
        }
    }

    async getAll() {
        try {
            const data = []
            const snapshot = await this.query.get();
            snapshot.forEach(doc => {
                data.push({id: doc.id, ...doc.data()})
            });

            return data;
        } catch(err) {
            throw new Error('Ocurrió un error obteniendo los productos.', err);
        }
    }

    async deleteById(id) {
        try {
            const idFormatted = id.toString();
            const itemToDeleted = await this.query.where('codigo', '==', idFormatted).get();

            itemToDeleted.forEach(item => {
                item.ref.delete();
            });
        } catch (err) {
            throw new Error('Ocurrió un error eliminando el producto.', err);
        }
    }

    async update(id, newData) {
        try {
            const idFormatted = id.toString();
            const itemToUpdate = await this.query.where('codigo', '==', idFormatted).get();

            itemToUpdate.forEach(item => {
                item.ref.set(newData);
            });
        } catch (err) {
            throw new Error ('Ocurrió un error actualizando el producto.', err);
        }
      };

      async deleteByIdCartAndIdProduct(cartId, productId) {
        try {
            const itemSnapshot = await this.query.where('id', '==', cartId).get();
            const productIdFormatted = productId.toString();

            const item = [];

            itemSnapshot.forEach(doc => {
                item.push({id: doc.id, ...doc.data()});
            })

            if (!item) {
                return error;
            }

            item[0].productos = item[0]?.productos?.filter(producto => producto.id !== productIdFormatted);

            const itemToRemoveSnapshot = await this.query.where('id', '==', cartId).get();

            itemToRemoveSnapshot.forEach(element => {
                element.ref.set(item[0]);
            });
        } catch (err) {
            throw new Error('Ocurrió un error al guardar el archivo.', err);
        }
    }

    async getProductsInCart(id) {
        try {
            const itemSnapshot = await this.query.where('id', '==', id).get();

            const item = [];

            itemSnapshot.forEach(doc => {
                item.push({id: doc.id, ...doc.data()});
            })

            if (!item || !item.length) {
                return error;
            }

            return item[0].productos ? item[0].productos : error;
        } catch(err) {
            throw new Error('Ocurrió un error obteniendo los carritos.', err);
        }
    }

    async saveProductInCart(obj, id) {
        try {
            const itemSnapshot = await this.query.where('id', '==', id).get();

            const item = [];

            itemSnapshot.forEach(doc => {
                item.push({id: doc.id, ...doc.data()});
            })

            if (!item) {
                return error;
            }

            item[0]?.productos?.push(obj);

            const itemToUpdateSnapshot = await this.query.where('id', '==', id).get();

            itemToUpdateSnapshot.forEach(element => {
                element.ref.set(item[0]);
            });
        } catch (err) {
            throw new Error('Ocurrió un error al guardar el archivo.', err);
        }
    }
}

export default firebaseProductsController;