#! /bin/bash
git checkout .
git pull
sed -i -e "s/password: '',/password: 'henearkr',/g" routes/*
