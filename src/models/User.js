import utils from './../utils';

class User {
    constructor(user = null) {
        this.id = -1;

        if (utils.is.number(user) && user > -1) {
            this.id = user;
        } else if (utils.is.object(user)) {
            // Take all properties by default
            Object.assign(this, user);
        }
    }
}

export default User;
