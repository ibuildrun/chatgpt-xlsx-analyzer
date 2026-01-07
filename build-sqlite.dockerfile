FROM almalinux:8

# Install devtoolset for newer GCC and tar
RUN dnf install -y gcc-toolset-12-gcc-c++ make python3 tar && \
    curl -fsSL https://rpm.nodesource.com/setup_20.x | bash - && \
    dnf install -y nodejs

WORKDIR /build

# Use devtoolset GCC
ENV CC=/opt/rh/gcc-toolset-12/root/usr/bin/gcc
ENV CXX=/opt/rh/gcc-toolset-12/root/usr/bin/g++

RUN npm init -y && npm install better-sqlite3@11.9.1

# Create tar archive of better-sqlite3 for deployment
CMD tar -czf /output/better-sqlite3-linux.tar.gz -C /build/node_modules better-sqlite3
