"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var client_1 = require("@prisma/client");
var prisma = new client_1.PrismaClient();
var DEMO_ADMIN_ID = '00000000-0000-0000-0000-000000000001';
var DEMO_CONTRIBUTOR_ID = '00000000-0000-0000-0000-000000000002';
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var adminProfile, contributorProfile, sampleDisaster1, sampleDisaster2, resources, _i, resources_1, res, createdRes;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('🌱 Starting Prisma database seed...');
                    return [4 /*yield*/, prisma.profile.upsert({
                            where: { id: DEMO_ADMIN_ID },
                            update: { role: client_1.Role.ADMIN },
                            create: {
                                id: DEMO_ADMIN_ID,
                                role: client_1.Role.ADMIN,
                            },
                        })];
                case 1:
                    adminProfile = _a.sent();
                    return [4 /*yield*/, prisma.profile.upsert({
                            where: { id: DEMO_CONTRIBUTOR_ID },
                            update: { role: client_1.Role.CONTRIBUTOR },
                            create: {
                                id: DEMO_CONTRIBUTOR_ID,
                                role: client_1.Role.CONTRIBUTOR,
                            },
                        })];
                case 2:
                    contributorProfile = _a.sent();
                    console.log("\u2705 Demo Admin Profile: ".concat(adminProfile.id));
                    console.log("\u2705 Demo Contributor Profile: ".concat(contributorProfile.id));
                    return [4 /*yield*/, prisma.disaster.create({
                            data: {
                                title: 'Manhattan Flooding',
                                description: 'Heavy flooding has affected low-lying areas of Manhattan, NYC.',
                                location: 'Manhattan, NYC',
                                latitude: 40.7831,
                                longitude: -73.9712,
                                tags: ['flood', 'water', 'urban'],
                                status: client_1.DisasterStatus.ACTIVE,
                                createdBy: adminProfile.id,
                            },
                        })];
                case 3:
                    sampleDisaster1 = _a.sent();
                    return [4 /*yield*/, prisma.disaster.create({
                            data: {
                                title: 'Wildfire near San Jose',
                                description: 'Containment efforts underway for brush fire spreading near foothills.',
                                location: 'San Jose, CA',
                                latitude: 37.3382,
                                longitude: -121.8863,
                                tags: ['wildfire', 'fire', 'evacuation'],
                                status: client_1.DisasterStatus.ACTIVE,
                                createdBy: contributorProfile.id,
                            },
                        })];
                case 4:
                    sampleDisaster2 = _a.sent();
                    console.log("\u2705 Sample Disaster 1 created: ".concat(sampleDisaster1.id, " (Manhattan)"));
                    console.log("\u2705 Sample Disaster 2 created: ".concat(sampleDisaster2.id, " (San Jose)"));
                    resources = [
                        {
                            name: 'Central Emergency Shelter A',
                            type: client_1.ResourceType.SHELTER,
                            latitude: 40.785,
                            longitude: -73.97, // ~0.24 km from disaster
                        },
                        {
                            name: 'Manhattan General Hospital B',
                            type: client_1.ResourceType.HOSPITAL,
                            latitude: 40.79,
                            longitude: -73.965, // ~0.92 km from disaster
                        },
                        {
                            name: 'Clean Water Distribution Point C',
                            type: client_1.ResourceType.WATER,
                            latitude: 40.82,
                            longitude: -73.94, // ~4.81 km from disaster
                        },
                        {
                            name: 'Northern Relief Food Hub D',
                            type: client_1.ResourceType.FOOD,
                            latitude: 40.85,
                            longitude: -73.91, // ~9.04 km from disaster
                        },
                        {
                            name: 'Regional Rescue Operations Base E',
                            type: client_1.ResourceType.RESCUE,
                            latitude: 41.0,
                            longitude: -73.8, // ~28.2 km from disaster (Outside 10km radius)
                        },
                    ];
                    _i = 0, resources_1 = resources;
                    _a.label = 5;
                case 5:
                    if (!(_i < resources_1.length)) return [3 /*break*/, 8];
                    res = resources_1[_i];
                    return [4 /*yield*/, prisma.resource.create({ data: res })];
                case 6:
                    createdRes = _a.sent();
                    console.log("\u2705 Seeded Resource [".concat(createdRes.type, "]: ").concat(createdRes.name, " (").concat(createdRes.id, ")"));
                    _a.label = 7;
                case 7:
                    _i++;
                    return [3 /*break*/, 5];
                case 8:
                    console.log('🌱 Database seeding completed successfully.');
                    return [2 /*return*/];
            }
        });
    });
}
main()
    .catch(function (e) {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
})
    .finally(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma.$disconnect()];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
