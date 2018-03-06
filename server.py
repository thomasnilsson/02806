# Host web server with port 8887
python -m http.server 8887 &

# Clear port again if it's being used (it shouldn't be)
sudo lsof -i :8887
sudo kill -9 <PID>