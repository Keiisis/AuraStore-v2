import https from 'node:https';
import fs from 'node:fs';

const options = {
    hostname: 'etzunbqflskvjpnathqa.supabase.co',
    path: '/rest/v1/orders?select=id,customer_name,total,provider_order_id,created_at&order=created_at.desc&limit=8',
    headers: {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV0enVuYnFmbHNrdmpwbmF0aHFhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDczOTI0MCwiZXhwIjoyMDg2MzE1MjQwfQ.4FVvompV5dQN07lsHnWueaJpLyO3oWjOQTjVGP-fPpY',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV0enVuYnFmbHNrdmpwbmF0aHFhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDczOTI0MCwiZXhwIjoyMDg2MzE1MjQwfQ.4FVvompV5dQN07lsHnWueaJpLyO3oWjOQTjVGP-fPpY'
    }
};

https.get(options, res => {
    let d = '';
    res.on('data', c => d += c);
    res.on('end', () => {
        fs.writeFileSync('orders_dump.json', d);
        console.log('Written to orders_dump.json');
    });
}).on('error', e => console.error(e));
