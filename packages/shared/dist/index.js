import os from 'os';
export const getIp = () => {
    var _a;
    const interfaces = os.networkInterfaces();
    for (const key in interfaces) {
        const iface = (_a = interfaces[key]) !== null && _a !== void 0 ? _a : [];
        for (let i = 0; i < iface.length; i++) {
            const alias = iface[i];
            if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
                return alias.address;
            }
        }
    }
    return '0.0.0.0';
};
