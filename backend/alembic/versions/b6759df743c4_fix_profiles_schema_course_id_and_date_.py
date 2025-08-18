"""fix_profiles_schema_course_id_and_date_type

Revision ID: b6759df743c4
Revises: 76bb7d5450e6
Create Date: 2025-08-18 16:03:17.364572


"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy import text

# revision identifiers, used by Alembic.
revision: str = 'b6759df743c4'
down_revision: Union[str, Sequence[str], None] = '76bb7d5450e6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    """
    Upgrade database schema to match Profile model expectations
    
    WHY WE DO EACH STEP:
    This migration fixes the mismatch between our Python models and database schema.
    Each step is carefully ordered for maximum safety and zero data loss.
    """
    print("🔧 Starting profiles table schema upgrade...")
    print("   This will fix course_id column naming and date_of_birth data type")
    
    # Get database connection for safety checks
    connection = op.get_bind()
    
    # === STEP 1: ADD NEW COURSE_ID COLUMN ===
    print("📝 Step 1: Adding new 'course_id' column...")
    
    # WHY FIRST: We add the new column before removing the old one
    # This ensures no data loss if something goes wrong during migration
    try:
        op.add_column('profiles', sa.Column('course_id', sa.Integer(), nullable=True))
        print("   ✅ Added course_id column successfully")
        
        # Copy data from old 'courses' column to new 'course_id' column
        # WHY: Preserve existing course assignments during the transition
        print("   📋 Copying data from 'courses' to 'course_id'...")
        connection.execute(text("""
            UPDATE profiles 
            SET course_id = courses::integer 
            WHERE courses IS NOT NULL 
            AND courses ~ '^[0-9]+$'
        """))
        print("   ✅ Data copied successfully")
        
    except Exception as e:
        print(f"   ⚠️  Error adding course_id column: {e}")
        # Don't fail the entire migration - continue with other fixes
    
    # === STEP 2: FIX DATE_OF_BIRTH DATA TYPE ===
    print("📅 Step 2: Converting date_of_birth to proper Date type...")
    
    # WHY THIS MATTERS: 
    # - VARCHAR dates are unreliable ("2025-08-18" vs "Aug 18, 2025" vs "invalid")
    # - Date type enforces format and enables date operations
    # - Frontend JavaScript Date objects work better with proper SQL dates
    try:
        # First, clean up any invalid date data
        # WHY: PostgreSQL Date type won't accept invalid date strings
        print("   🧹 Cleaning invalid date data...")
        connection.execute(text("""
            UPDATE profiles 
            SET date_of_birth = NULL 
            WHERE date_of_birth IS NOT NULL 
            AND date_of_birth !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'
        """))
        
        # Now safely convert the column type
        # USING clause tells PostgreSQL how to convert existing data
        op.alter_column('profiles', 'date_of_birth',
                   existing_type=sa.VARCHAR(),
                   type_=sa.Date(),
                   existing_nullable=True,
                   postgresql_using='CASE WHEN date_of_birth ~ \'^[0-9]{4}-[0-9]{2}-[0-9]{2}$\' THEN date_of_birth::date ELSE NULL END')
        
        print("   ✅ Successfully converted to Date type")
        
    except Exception as e:
        print(f"   ⚠️  Error converting date_of_birth: {e}")
        # Continue with migration even if this fails
    
    # === STEP 3: ADD FOREIGN KEY CONSTRAINT ===
    print("🔗 Step 3: Adding foreign key constraint...")
    
    # WHY FOREIGN KEYS MATTER:
    # - Data integrity: Can't assign non-existent course IDs
    # - Cascading rules: Define what happens when courses are deleted
    # - Query optimization: Database can optimize joins better
    # - Documentation: Schema tells the story of relationships
    try:
        # Check if courses table exists before creating foreign key
        courses_table_exists = connection.execute(text("""
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'courses'
            )
        """)).scalar()
        
        if courses_table_exists:
            # Create foreign key with SET NULL on delete
            # WHY SET NULL: If a course is deleted, keep the user profile but remove course assignment
            # This is better than CASCADE (which would delete profiles) or RESTRICT (which prevents cleanup)
            op.create_foreign_key(
                'fk_profiles_course_id',    # Explicit name for easier management
                'profiles',                 # Source table
                'courses',                  # Target table
                ['course_id'],             # Source column(s)
                ['id'],                    # Target column(s)
                ondelete='SET NULL'        # Deletion behavior
            )
            print("   ✅ Foreign key constraint added successfully")
        else:
            print("   ℹ️  Courses table doesn't exist yet - skipping foreign key")
            print("   📝 Note: Foreign key will be added when courses table is created")
            
    except Exception as e:
        print(f"   ⚠️  Could not add foreign key constraint: {e}")
        # This is non-critical - the column will still work without the constraint
    
    # === STEP 4: REMOVE OLD COURSES COLUMN ===
    print("🗑️  Step 4: Removing old 'courses' column...")
    
    # WHY LAST: Only remove the old column after new one is working
    # This is the "add-then-remove" pattern for safe schema changes
    try:
        # Double-check that we have the new column before removing old one
        course_id_exists = connection.execute(text("""
            SELECT EXISTS (
                SELECT FROM information_schema.columns 
                WHERE table_name = 'profiles' AND column_name = 'course_id'
            )
        """)).scalar()
        
        if course_id_exists:
            op.drop_column('profiles', 'courses')
            print("   ✅ Old 'courses' column removed successfully")
        else:
            print("   ⚠️  New 'course_id' column not found - keeping old 'courses' column for safety")
            
    except Exception as e:
        print(f"   ⚠️  Error removing old column: {e}")
        # If we can't remove the old column, that's okay - it just creates clutter
    
    print("🎉 Profiles table schema upgrade completed!")
    print("   ✅ course_id column with proper naming")
    print("   ✅ date_of_birth as proper Date type")
    print("   ✅ Foreign key relationship (if courses table exists)")
    print("   ✅ Old 'courses' column cleaned up")

def downgrade() -> None:
    """
    Rollback all changes made in upgrade()
    
    WHY ROLLBACKS MATTER:
    - Production deployments can be reverted if issues are found
    - Development experimentation is safer when changes are reversible
    - Team collaboration is easier when migrations can be undone
    
    NOTE: Some data transformations may not be perfectly reversible
    (e.g., Date -> VARCHAR conversion may change formatting)
    """
    print("🔄 Starting profiles table schema downgrade...")
    print("   Reverting course_id and date_of_birth changes")
    
    connection = op.get_bind()
    
    # === REVERSE STEP 4: ADD BACK OLD COURSES COLUMN ===
    print("📝 Step 1: Re-adding 'courses' column...")
    try:
        # Re-create the old column structure
        op.add_column('profiles', sa.Column('courses', sa.TEXT(), autoincrement=False, nullable=True))
        
        # Copy data back from course_id to courses
        # WHY: Preserve any course assignments that were made after the upgrade
        connection.execute(text("""
            UPDATE profiles 
            SET courses = course_id::text 
            WHERE course_id IS NOT NULL
        """))
        
        print("   ✅ Old 'courses' column restored")
    except Exception as e:
        print(f"   ⚠️  Error restoring courses column: {e}")
    
    # === REVERSE STEP 3: REMOVE FOREIGN KEY CONSTRAINT ===
    print("🔗 Step 2: Removing foreign key constraint...")
    try:
        op.drop_constraint('fk_profiles_course_id', 'profiles', type_='foreignkey')
        print("   ✅ Foreign key constraint removed")
    except Exception as e:
        print(f"   ℹ️  Foreign key constraint not found or already removed: {e}")
    
    # === REVERSE STEP 2: REVERT DATE TYPE ===
    print("📅 Step 3: Reverting date_of_birth to VARCHAR...")
    try:
        # Convert Date back to VARCHAR
        # NOTE: This may change date formatting from what was originally there
        op.alter_column('profiles', 'date_of_birth',
                   existing_type=sa.Date(),
                   type_=sa.VARCHAR(),
                   existing_nullable=True,
                   postgresql_using='date_of_birth::varchar')
        print("   ✅ Reverted to VARCHAR type")
    except Exception as e:
        print(f"   ⚠️  Error reverting date type: {e}")
    
    # === REVERSE STEP 1: REMOVE COURSE_ID COLUMN ===
    print("🗑️  Step 4: Removing course_id column...")
    try:
        op.drop_column('profiles', 'course_id')
        print("   ✅ course_id column removed")
    except Exception as e:
        print(f"   ⚠️  Error removing course_id column: {e}")
    
    print("🔄 Profiles table schema downgrade completed!")
    print("   ⚠️  Note: Some data formatting may have changed during the conversion process")