FROM kartoza/geoserver:latest

# Replace Tomcat config to work properly behind HTTPS proxy
COPY server.xml /usr/local/tomcat/conf/server.xml

# Set proxy base URL (optional but useful)
ENV GEOSERVER_WEB_URL=https://{{ geostack_domain }}/geoserver/

EXPOSE 8080