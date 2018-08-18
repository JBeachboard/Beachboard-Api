//simple healthcheck

export const healthcheck = (req,res) => {
    res.json({
        status: 'ok',
        uptime: process.uptime(),
        name: 'code test',
        version: process.env.npm_package_version,
        notes: 'This was a triumph, huge success.'
    });  
}
