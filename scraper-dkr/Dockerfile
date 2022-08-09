FROM amazon/aws-lambda-nodejs:12

# Credentials: Vinny AWS user
ARG AWS_ACCESS_KEY_ID=
ARG AWS_SECRET_ACCESS_KEY=
ARG AWS_REGION=eu-west-2

# Install Chrome to get all of the dependencies installed
RUN yum install -y amazon-linux-extras
RUN amazon-linux-extras install epel -y
RUN yum install -y chromium

ENV AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID \
    AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY \
    AWS_REGION=$AWS_REGION

COPY Scraper.js ${LAMBDA_TASK_ROOT}
COPY package.json ${LAMBDA_TASK_ROOT}
COPY package-lock.json ${LAMBDA_TASK_ROOT}
COPY outputs.json ${LAMBDA_TASK_ROOT}

RUN npm install

CMD [ "Scraper.Scraper" ]