

def convertToMin(inFile,combFile,saveAs):
	outF = open(saveAs,'w')
	combF = open(combFile,'r')
	combLines = combF.readlines()
	combF.close()
	with open(inFile,'r') as inF:
		for i,line in enumerate(inF):
			if i == 0:
				l = line.split(',')[0]
				l += ',time_men,time_women\n'
				outF.write(l)
			else:
				l_split = line.split(',')
				l = ''
				l += str(l_split[0])+','
				time = l_split[3].split(':')
				mins = (60*int(time[0]))+int(time[1])
				l += str(mins)+','
				if i >= 70:
					time = combLines[i-69].split(',')[3].split(':')
					mins = (60*int(time[0]))+int(time[1])
					l += str(mins)
				else:
					l += ''
				l += '\n'
				outF.write(l)
	outF.close()

if __name__ == '__main__':
	convertToMin(inFile='boston_marathon_men.csv',combFile='boston_marathon_women.csv',saveAs='boston_marathon_times.csv')