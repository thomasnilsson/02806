import numpy as np
import json

def processData(filename):
	data = np.zeros((12,4),dtype=np.uint8)
	categoies = []
	with open(filename,'r') as f:
		for i,l in enumerate(f):
			s = l.split(',')
			if i == 0:
				labels = s[3:]
				labels[-1] = labels[-1][:-1]
			else:
				categoies.append(s[1]+'_'+s[2])
				for i,k in enumerate(s):
					if i > 2:
						data[i-3,int(s[0])] = int(k)
	with open('green_market_processed.csv','w') as f:
		s = 'month,'+','.join(categoies)+'\n'
		f.write(s)
		for i in range(12):
			s = labels[i]+','+','.join(map(str,data[i,:]))+'\n'
			f.write(s)

if __name__ == '__main__':
	processData('green_market.csv')