FROM jetty:9
COPY build/libs/ROOT.war /var/lib/jetty/webapps/ROOT.war
