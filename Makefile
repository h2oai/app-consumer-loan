
build:
	rm -fr tmp
	R -f script.R
	mkdir -p lib
	cp tmp/h2o-genmodel.jar lib
	echo "package org.gradle;" > tmp/package.java
	echo "" >> tmp/package.java
	cat tmp/package.java tmp/BadLoanModel.java > src/main/java/org/gradle/BadLoanModel.java
	cat tmp/package.java tmp/InterestRateModel.java > src/main/java/org/gradle/InterestRateModel.java
	./gradlew build

clean:
	rm -fr tmp
	rm -f lib/h2o-genmodel.jar
	rm -f src/main/java/org/gradle/BadLoanModel.java
	rm -f src/main/java/org/gradle/InterestRateModel.java
	./gradlew clean

run:
	./gradlew jettyRunWar

