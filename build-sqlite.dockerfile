FROM almalinux:8

# Enable PowerTools for newer gcc
RUN dnf install -y epel-release && \
    dnf install -y gcc-toolset-12-gcc-c++ make python3 && \
    dnf clean all

# Install Node.js 20
RUN curl -fsSL https://rpm.nodesource.com/setup_20.x | bash - && \
    dnf install -y nodejs

WORKDIR /build

# Use gcc-toolset-12 for C++20 support
ENV PATH="/opt/rh/gcc-toolset-12/root/usr/bin:$PATH"
ENV LD_LIBRARY_PATH="/opt/rh/gcc-toolset-12/root/usr/lib64:$LD_LIBRARY_PATH"

# Install better-sqlite3 and build it
RUN npm init -y && \
    npm install better-sqlite3@12.5.0

# The built binary will be in /build/node_modules/better-sqlite3/build/Release/
CMD ["tar", "-czf", "/output/better-sqlite3-linux.tar.gz", "-C", "/build/node_modules/better-sqlite3", "build"]
