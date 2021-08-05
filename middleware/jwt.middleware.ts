import {getDefaultSettings} from "http2";
import jwt from 'jsonwebtoken'
import {Container} from "typescript-ioc";
import {FileService} from '../services/file.service';

const tokenKey = '1a2b-3c4d-5e6f-7g8h'

const fileService: FileService = Container.get(FileService);

const users = fileService.get()

const jwtMiddleware = (req, res, next) => {

    /** TODO: [VT] 05.08.2021, 17:00: Работать с токеном */
    const token = req.headers['authorization'];

    /** TODO: [VT] 05.08.2021, 17:02: there is not token */

    const user = users.find(user => user.id === parseInt(req.body.id, 0))

    /** TODO: [VT] 05.08.2021, 17:02: token not found */

    if (req.headers.authorization) {

        /** TODO: [VT] 05.08.2021, 17:02: verify - выбрасывает исключение
         *
         * try {
              jwt.verify(token, 'wrong-secret');

              // payload.id === user

              next()
            } catch(err) {
              // err
              403
            }
         *
         * */


        jwt.verify(
            req.headers.authorization.split(' ')[1],
            tokenKey,

            (err, payload) => {

                if (err) {

                    next();

                } else if (payload) {

                    /** TODO: [VT] 04.08.2021, 17:10: Объект === number ??? ? */
                    if (user === payload.id) {
                        req.user = user
                        next()
                    }

                    if (!req.user) {
                        next();
                    }
                }
            }
        );
    } else {
        return res.status(403);
    }

    next();
};

module.exports = jwtMiddleware
