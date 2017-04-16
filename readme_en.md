## Path Crawler

---

### Configuration

1. **Windows 10** is the recommended operating system.
2. Installation of **node.js**: visit [https://nodejs.org/en/]([https://nodejs.org/en/](https://nodejs.org/en/)) and download the lastest version of `node.js`. You'd better download the `.msi` . You should take notice that if the options of adding `node.js` to your Windows envrionment variable has been selected.
3. Installation of **git bash**: visit [https://git-for-windows.github.io/](https://git-for-windows.github.io/)  and download `git for windows`. After installation there will be a command line tool named `git bash` in your computer. You can use it to crawler the path data.

---

### Preprocessing

1. Format your origin data and destination data in Excel as follows:

   | Name of origin or destination | X coordinate | Y coordinate | Other columns |
   | ----------------------------- | ------------ | ------------ | ------------- |
   |                               |              |              |               |

2. Export your data as a **.txt** file splited in **\t(tab)**(using the export function of Excel).  

3. Ensure your output data is encoded by **UTF-8**. If not, you can open it in Windows text editor and save as a **UTF-8** files by selecting the `Encoding` options.

4. Move your origin file and destination file to the directory `./path_crawler/data_sources`.

---

### Combination of Data

Configure and run the **Combination.js** to combine origin data with destination data.

1. Configure **line 6 to 10** of `combination.js` to add your origin data

   ```js
   const readStreamOfComm = readLineStream(fs.createReadStream('./data_sources/origin_utf8.txt'), {
       newline: '\n',
       autoNext: false
   });
   ```

2. Configure **line 12 to 16** of `combination.js` to add your destination data

   ```js
   const readStreamOfHos = readLineStream(fs.createReadStream('./data_sources/destination_utf8.txt'), {
       newline: '\n',
       autoNext: false
   });
   ```

3. Options: every line of data is stored in the array `elements` . The subscript `n` means the number n attribution value of every line of data.  You can configure it to make the program can read your data correctly. In **line 25 to 29** you can change the `n` of origin data, and in **line 37 to 39** you can change the `n` of destination data.

4. Run `combination.js`: **right click** in the directory `./path_crawler` and choose `git bash here`, then run:

   ```bash
   node combination.js
   ```

   The output files `combination+num.txt` will be exported to directory `./path_crawler/combination_files`.

---

### Crawl Path Data

Configure and run the **Read.js** to crawl path data from **Baidu Map API**.

1. Configure **line 62 and line 89** of `Read.js` to change the transit mode, including driving, walking, transit and riding.

   ```js
   // line 62
   qs: {
     	mode: 'waliking',
       ...
   }

   // line 89
   let tranSchema = 'walking';
   ```

2. If you have only one  `combination+num.txt`,  you can skip to step 4 and run `Read.js`.

3. If you have tons of combination files, you should change the input file and output file by configuring **line 53** every time before you run `Read.js`:

   ```js
   pathAnalysis('./combination_files/combination35.txt', './path_results/path35.txt');
   ```

   then you should change the key in **line 68**:

   ```js
   ak: 'dOaspTMmxaxRBGDHFApy8pdvnvCGzuX3'
   ```

4. Run `Read.js`: **right click** in the directory `./path_crawler` and choose `git bash here`, then run:

   ```bash
   node Read.js
   ```

   Then the program will run and output the result to directory `./path_results`.

5. The output data will be format as follows splited in **\t(tab)**:

   | Num of origin | Num of destination | ID   | time(second) | distance(kilometer) | transit mode | path(x, y) |
   | ------------- | ------------------ | ---- | ------------ | ------------------- | ------------ | ---------- |
   |               |                    |      |              |                     |              |            |

   ​