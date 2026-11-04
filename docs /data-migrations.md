# Data Migrations

## Objective
Record methods for migrating the schemas, in particular UserSchema.

## How
1. Add migration backup type -- this is necessary to apply the versioned data correctly. 
2. Extend values (never remove attributes, unless 100% of users have been migrated).
3. Provide some kind of count for number of users left to migrate. 
4. Backfill values, update the migration number. 
5. Once migration number reduced to 0, swap to using new values. 
6. Once fully flipped over, remove attributes.

## Template
Phase 1: Extension
1. [ ] Add migration backup type -- backfills value explicitly (is this step necessary?).
2. [ ] Extend attributes.
3. [ ] Record migration count.

Phase 2: Backfill
1. [ ] Add explicit backup type to migrate over. Only run once, set tracking bool true. Only when it's true, use the extension value, both in setting and getting it.  
2. [ ] Backfill values, update migration number.

Phase 3: Swap
1. [ ] Swap to using new values.

Phase 4: Removal
1. [ ] Remove attributes.

## Considerations
Given that the data schema is encrypted and on the user device, the migration will have to be run by the users.
This means that extending attributes will be easy, but changing schemas will be quite different, and old patterns will likely need to be maintained as well, and in extreme cases, old users will need to be booted. 

## Patterns 
Use value Getters in situations where multiple schemas are being maintained simultaneously. This could have the added benefit of always existing, 
ie no type errors around being null or undefined. Consider using the typescript zod getter / setter pattern. 

## Value vs Null vs Undefined 
- Undefined: never set, which can include old schemas moved over to a new schema in a backwards compatible way. 
- Null: explicitly empty. 
- Value: set. 

## Questions
- How to reduce steps?
  - May be able to condense extension and backfilling. 
- How to track migrations? 
  - Could have a migrations data which has a unique name, a total user count, and a count.  

## Pressing Questions: 
- Is it necessary to have a backup type which moves values from one format to another explicitly?
  - A: yes, bc it means that all values are transitioned over in one version-controlled step, and then the new User attribute is in use, and old one is deprecated. 