var cal = new CalHeatMap();
var startDate = new Date();
startDate.setMonth(startDate.getMonth() - 11, 1);

cal.init({
  data: "/api/heatmap",
  domain: "month",
  start: startDate,
  domainGutter: 10,
  range: 12,
  legend: [1, 3, 5, 10, 20],
  onClick: function(date, nb) {
    
    vue.filterDate(date);
    
  }
});

// Set moment locale
moment.locale(navigator.language || navigator.userLanguage);

var apiURL = '/api';

var vue = new Vue({

  el: '#timeline',

  data: {
    data: [],
    deliveries: [],
    softwares: [],
    environments: [],
    currentSoft: "",
    currentEnv: "",
    currentDate: "",
    colors: [
      '#2ecc71',
      '#5bc0de',
      '#3498db'
    ]
  },

  created: function () {
    this.fetchData(true);
  },

  watch: {
    //currentBranch: 'fetchData'
  },

  filters: {
    truncate: function (v) {
      var newline = v.indexOf('\n');
      return newline > 0 ? v.slice(0, newline) : v;
    },
    formatDateTime: function (v) {
      return moment(v).format('LLLL');
    },
    formatDate: function (v) {
      return moment(v).format('LL');
    },
    getChangelogURL: function(v) {
      if(v.repository.length === 0) return;
      return `https://${v.repository}/src/HEAD/CHANGELOG.md?at=master`;
    }
  },

  methods: {
    setLocation: function(key, value) {
      
      // Get location hash
      var hash = location.hash.replace('#', '').split('&'),
        isChanged = false,
        i;
      
      // Convert value
      value = encodeURIComponent(value);
      
      // For each hash
      for (i in hash) {
        
        hash[i] = hash[i].split('=');
        
        // If the key already exist, replace it
        if (hash[i][0] == key) {
          hash[i][1] = value;
          isChanged = true;
        }
        
      }
      
      // If the key is new, add it
      if (isChanged === false) {
        hash.push([key, value]);
      }
      
      // For each hash, create the hashReturn if the value isn't empty
      var hashReturn = [];
      for (i in hash) {
        if (hash[i][1]) {
          hashReturn.push(hash[i].join('='));
        }
      }
      
      location.hash = hashReturn.join('&');
      
    },
    initLocation: function() {
      
      // Get location hash
      var hash = location.hash.replace('#', '').split('&');
      
      // For each hash, filter by the key
      for (var i in hash) {
        
        hash[i] = hash[i].split('=');
        
        key = hash[i][0];
        value = decodeURIComponent(hash[i][1]);
        
        if (key == 'software') {
          this.filterSoft(value);
        } else if (key == 'environment') {
          this.filterEnv(value);
        } else if (key == 'date') {
          this.filterDate(new Date(value));
        }
        
      }
      
    },
    populateDeliveries: function(data) {
      
      this.deliveries = [];
      
      if (data.length) {
        for (var i in data) {
          if (
              (this.currentSoft === "" || data[i].software == this.currentSoft) &&
              (this.currentEnv === "" || data[i].environment == this.currentEnv) &&
              (this.currentDate === "" || ((new Date(data[i].date)).toDateString() == this.currentDate.toDateString()))
            ) {
            this.deliveries.push(data[i]);
          }
        }
      }
      
    },
    filterSoft: function(name){
      
      this.deliveries = [];
      
      if (this.currentSoft == name){
        this.currentSoft = "";
      } else {
        this.currentSoft = name;
      }
      
      this.setLocation('software', this.currentSoft);
      this.populateDeliveries(this.data);
      
    },
    filterEnv: function(name){
      
      this.deliveries = [];
      
      if (this.currentEnv == name){
        this.currentEnv = "";
      } else {
        this.currentEnv = name;
      }
      
      this.setLocation('environment', this.currentEnv);
      this.populateDeliveries(this.data);
      
    },
    filterDate: function(date){
      
      if (this.currentDate && this.currentDate.toString() == date.toString()) {
        this.currentDate = "";
      } else {
        this.currentDate = date;
      }
      
      this.setLocation('date', this.currentDate);
      this.populateDeliveries(this.data);
      
    },
    fetchData: function (first) {
      var xhr = new XMLHttpRequest();
      var self = this;
      xhr.open('GET', apiURL + "/deliveries");
      xhr.onload = function () {
        d = JSON.parse(xhr.responseText);
        self.data = d;
        var index, i;
        
        for (i = 0; i < d.length ; i++) {
          
          index = self.softwares.indexOf(d[i].software);
          if (index === -1) {
            self.softwares.push(d[i].software);
            index = self.softwares.length-1;
          }
          
          index = self.environments.indexOf(d[i].environment);
          if (index === -1) {
            self.environments.push(d[i].environment);
            index = self.environments.length-1;
          }
          
        }
        
        self.softwares.sort();
        self.environments.sort();
        
        for (i in self.data) {
          
          index = self.environments.indexOf(self.data[i].environment);
          self.data[i].environmentColor = self.colors[index];
          
        }
        
        self.populateDeliveries(self.data);
        
        // On first fetch, initLocation hash
        if (first === true) {
          self.initLocation();
        }
        
      };
      xhr.send();
    }
  }
});