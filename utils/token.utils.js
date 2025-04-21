exports.generateToken = () => {
    const charList = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < 32; i++) {
        token += charList.charAt(Math.floor(Math.random() * charList.length));
    }
    return token;
}