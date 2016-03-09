(function() {
  'use strict';

  app.controller('HomeCtrl', ['$scope', 'FetchFileFactory',
    function($scope, FetchFileFactory) {
      $scope.fileViewer = 'Please select a file to view its contents';

      $scope.tree_core = {
        
        multiple: false,  // disable multiple node selection

        check_callback: function (operation, node, node_parent, node_position, more) {
            // operation can be 'create_node', 'rename_node', 'delete_node', 'move_node' or 'copy_node'
            // in case of 'rename_node' node_position is filled with the new node name

            if (operation === 'move_node') {
                return false;   // disallow all dnd operations
            }
            return true;  // allow all other operations
        }
                              };

      $scope.nodeSelected = function(e, data) {
        var _l = data.node.li_attr;
        if (_l.isLeaf && typeof FetchFileFactory.fetchFile(_l.base) === 'object') {
                              var _d = data.data;

          FetchFileFactory.fetchFile(_l.base).then(function(data) {
            var _d = data.data;
            if (typeof _d == 'object') {
              _d = JSON.stringify(_d, undefined, 2);
            }
            $scope.fileViewer = _d;
            $scope.text = '';
            $scope.text2 = '';
            $scope.fileView = '';
          });
                              }else {
                            if(typeof FetchFileFactory.fetchFile(_l.base) !== 'object' && _l.isLeaf)
                              {
                             $scope.$apply(function() {
                                           $scope.fileViewer='';
                                            $scope.text = 'This document is not available in this view.';
                                            $scope.text2 = 'Click here to view';
                                           var file=JSON.stringify(FetchFileFactory.fetchFile(_l.base));
                                           var res = file.split("public");
                                           var res2 = res[1].substring(0,res[1].length-1);
                                           $scope.fileView = res2;
 
                                           });
                              }
                              else{
          $scope.$apply(function() {
            $scope.fileViewer = 'Please select a file to view its contents';
          });
                              }
        }
      };
    }
  ]);

}());
