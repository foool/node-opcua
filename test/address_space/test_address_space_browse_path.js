require("requirish")._(module);
var should = require("should");
var assert = require("better-assert");
var util = require("util");

var get_mini_address_space = require("test/fixtures/fixture_mininodeset_address_space").get_mini_address_space;
var address_space_for_conformance_testing = require("lib/simulation/address_space_for_conformance_testing");
var add_eventGeneratorObject = address_space_for_conformance_testing.add_eventGeneratorObject;

var AddressSpace = require("lib/address_space/address_space").AddressSpace;
var StatusCodes = require("lib/datamodel/opcua_status_code").StatusCodes;


var makeBrowsePath = require("lib/address_space/make_browse_path").makeBrowsePath;

var doDebug = false;

describe("AddressSpace#browsePath", function () {

    var addressSpace = null;

    before(function(done) {
        get_mini_address_space(function (err, data) {
            addressSpace = data;

            // Add EventGeneratorObject
            add_eventGeneratorObject(addressSpace,"ObjectsFolder");

            done(err);
        });
    });

    after(function(){
        if (addressSpace){
            addressSpace.dispose();
            addressSpace = null;
        }
    });

    it("should browse Server",function() {

        var browsePath = makeBrowsePath("RootFolder","/Objects/Server");
        var result = addressSpace.browsePath(browsePath);
        result.statusCode.should.eql(StatusCodes.Good);
        result.targets.length.should.eql(1);

        if (doDebug) {
            var opts = {addressSpace: addressSpace};
            console.log(result.toString(opts));
        }
    });
    it("should browse Status",function() {

        var browsePath = makeBrowsePath("RootFolder","/Objects/Server/ServerStatus");
        var result = addressSpace.browsePath(browsePath);
        result.statusCode.should.eql(StatusCodes.Good);
        result.targets.length.should.eql(1);

        if (doDebug) {
            var opts = {addressSpace: addressSpace};
            console.log(result.toString(opts));

        }
    });

    it("should browse EventGeneratorObject",function() {
        var browsePath = makeBrowsePath("RootFolder","/Objects/EventGeneratorObject");
        var result = addressSpace.browsePath(browsePath);
        result.statusCode.should.eql(StatusCodes.Good);
        result.targets.length.should.eql(1);

        if (doDebug) {
            var opts = {addressSpace: addressSpace};
            console.log("browsePath", browsePath.toString(opts));
            console.log("result", result.toString(opts));

            console.log(addressSpace.rootFolder.objects.toString());
        }
    });

    it("should browse MyEventType",function() {

        var browsePath = makeBrowsePath("RootFolder", "/Types/EventTypes/BaseEventType<HasSubtype>MyEventType");
        var result = addressSpace.browsePath(browsePath);
        result.statusCode.should.eql(StatusCodes.Good);
        result.targets.length.should.eql(1);

        if (doDebug) {
            var opts = {addressSpace: addressSpace};
            console.log("browsePath", browsePath.toString(opts));
            console.log("result", result.toString(opts));
        }

        var node  = addressSpace.findNode(result.targets[0].targetId).browseName.toString().should.eql("MyEventType");

        browsePath = makeBrowsePath("RootFolder", "/Types/EventTypes/BaseEventType<!HasSubtype>MyEventType");
        result = addressSpace.browsePath(browsePath);
        result.statusCode.should.eql(StatusCodes.BadNoMatch);

        browsePath = makeBrowsePath("RootFolder", "/Types/EventTypes/BaseEventType<#HasSubtype>MyEventType");
        result = addressSpace.browsePath(browsePath);
        result.statusCode.should.eql(StatusCodes.Good);

        var evType = addressSpace.findNode(result.targets[0].targetId);

        // rowing upstream
        browsePath = makeBrowsePath(evType,"<!HasSubtype>BaseEventType<!Organizes>EventTypes<!Organizes>Types<!Organizes>Root");
        result = addressSpace.browsePath(browsePath);
        result.statusCode.should.eql(StatusCodes.Good);
        addressSpace.findNode(result.targets[0].targetId).browseName.toString().should.eql("Root");

    });
});


