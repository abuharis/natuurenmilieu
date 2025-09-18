# Natuur&milieu
Back end repository

### Fix for nginx default
Nginx docker image comes with a default.conf inside conf.d and that get served when a request falls on port 80.
It can be fixed by deleting the file from the container manually or rebuild the image without the file.

```bash
docker exec -it nginx rm /etc/nginx/conf.d/default.conf
```
