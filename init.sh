#!/bin/sh

ROOTDIR=certs/root
ROOTCA=$ROOTDIR/ca-crt.pem
SERVERDIR=certs/server
SERVERKEY=$SERVERDIR/server-key.pem
CLIENTDIR=certs/client

mkdir -p $ROOTDIR
mkdir -p $SERVERDIR
mkdir -p $CLIENTDIR

if [ ! -r $ROOTCA ]; then
  echo "Generating Root Certificate Authority"
  cat > $ROOTDIR/ca.cnf << ENDENDEND
[ ca ]
default_ca      = CA_default

[ CA_default ]
serial = ca-serial
crl = ca-crl.pem
database = ca-database.txt
name_opt = CA_default
cert_opt = CA_default
default_crl_days = 9999
default_md = md5

[ req ]
default_bits           = 4096
days                   = 9999
distinguished_name     = req_distinguished_name
attributes             = req_attributes
prompt                 = no
output_password        = password

[ req_distinguished_name ]
C                      = US
ST                     = MA
L                      = Boston
O                      = Example Co
OU                     = techops
CN                     = ca
emailAddress           = certs@example.com

[ req_attributes ]
challengePassword      = test
ENDENDEND

  openssl req -new -x509 -days 9999 -config $ROOTDIR/ca.cnf -keyout $ROOTDIR/ca-key.pem -out $ROOTCA
fi

if [ ! -r $SERVERKEY ]; then
  echo "Generating Server Key"
  cat > $SERVERDIR/server.cnf << ENDENDEND
[ req ]
default_bits           = 4096
days                   = 9999
distinguished_name     = req_distinguished_name
attributes             = req_attributes
prompt                 = no
x509_extensions        = v3_ca

[ req_distinguished_name ]
C                      = US
ST                     = MA
L                      = Boston
O                      = Example Co
OU                     = techops
CN                     = localhost
emailAddress           = certs@example.com

[ req_attributes ]
challengePassword      = password

[ v3_ca ]
authorityInfoAccess = @issuer_info

[ issuer_info ]
OCSP;URI.0 = http://ocsp.example.com/
caIssuers;URI.0 = http://example.com/ca.cert
ENDENDEND

  echo "Generating private server key"
  openssl genrsa -out $SERVERKEY 4096

  echo "Generating signing request"
  openssl req -new -config $SERVERDIR/server.cnf -key $SERVERKEY -out $SERVERDIR/server-csr.pem
  
  echo "Signing request with our root CA"
  openssl x509 -req -extfile $SERVERDIR/server.cnf -days 999 -passin "pass:password" -in $SERVERDIR/server-csr.pem -CA $ROOTCA -CAkey $ROOTDIR/ca-key.pem -CAcreateserial -out $SERVERDIR/server-crt.pem
fi

if [ ! -r $CLIENTDIR/client1-key.pem ]; then
  for i in 1 2 3 4; do
    echo "Generating client key $i"
    C=$CLIENTDIR/client$i-key.pem
    CSR=$CLIENTDIR/client$i-csr.pem
    CRT=$CLIENTDIR/client$i-crt.pem
    PFX=$CLIENTDIR/client$i.pfx
    CFG=$CLIENTDIR/client$i.cfg

    cat > $CFG << ENDENDEND
[ req ]
default_bits           = 4096
days                   = 9999
distinguished_name     = req_distinguished_name
attributes             = req_attributes
prompt                 = no
x509_extensions        = v3_ca

[ req_distinguished_name ]
C                      = US
ST                     = MA
L                      = Boston
O                      = Example Co
OU                     = techops
CN                     = client$i
emailAddress           = certs@example.com

[ req_attributes ]
challengePassword      = password

[ v3_ca ]
authorityInfoAccess = @issuer_info

[ issuer_info ]
OCSP;URI.0 = http://ocsp.example.com/
caIssuers;URI.0 = http://example.com/ca.cert
ENDENDEND

    openssl genrsa -out $C 4096
    
    echo "Generating signing request"
    openssl req -new -config $CFG -key $C -out $CSR

    echo "Signing client certificate"
    openssl x509 -req -passin "pass:password" -days 3650 -in $CSR -CA $ROOTCA -CAkey $ROOTDIR/ca-key.pem -CAcreateserial -out $CRT

    echo "Exporting to pfx"
    openssl pkcs12 -export -password pass:test -out $PFX -inkey $C -in $CRT -certfile $ROOTCA
  done
fi
