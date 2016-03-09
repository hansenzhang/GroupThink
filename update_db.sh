if [ $# != 1 ]
then
    echo "Command must be given in the form 'update_db.sh <db_password>'"
else
    mongo heroku_app36069231 --eval "db.dropDatabase(); db.copyDatabase('heroku_app36069231', 'heroku_app36069231', 'ds037067.mongolab.com:37067/heroku_app36069231', 'admin', '$1')"
    echo "Copied!"
fi
