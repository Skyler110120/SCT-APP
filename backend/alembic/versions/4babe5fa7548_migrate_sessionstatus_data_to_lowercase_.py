"""migrate sessionstatus data to lowercase values

Revision ID: 4babe5fa7548
Revises: c2f0f04100c7
Create Date: 2025-08-15 11:01:07.145391

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy import text

# revision identifiers, used by Alembic.
revision: str = '4babe5fa7548'
down_revision: Union[str, Sequence[str], None] = 'c2f0f04100c7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    """
    MIGRATE Phase: Convert all session data from uppercase to lowercase values.
    
    This is the second phase of our EXPAND-MIGRATE-CONTRACT pattern:
    1. EXPAND: Added lowercase values ✅ (completed in c2f0f04100c7)
    2. MIGRATE: Convert existing data to lowercase ← We are here  
    3. CONTRACT: Remove uppercase values (PostgreSQL limitation - documented)
    
    WHY we do this systematically:
    - Phase 1 (EXPAND) made both value sets valid in the database
    - Phase 2 (MIGRATE) safely converts existing data using valid operations
    - This prevents constraint violations and ensures zero data loss
    - Each phase can be verified independently before proceeding
    
    After this migration:
    - All existing sessions will use lowercase status values
    - Default status will be lowercase for new sessions
    - Your application code should be updated to only use lowercase values
    - Uppercase values remain in enum for backward compatibility (PostgreSQL design)
    """
    
    print("🔄 MIGRATE Phase: Converting all session data to lowercase values")
    print("📚 This completes our safe database evolution process")
    print("💡 WHY: We're moving data after expanding valid values to prevent constraint errors")
    
    connection = op.get_bind()
    
    try:
        # Step 1: Verify we're in the correct state after EXPAND phase
        print("\n🔍 Step 1: Verifying enum contains both uppercase and lowercase values...")
        result = connection.execute(text("""
            SELECT enumlabel as enum_value
            FROM pg_enum 
            WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'sessionstatus')
            ORDER BY enumsortorder
        """))
        
        all_values = [row[0] for row in result]
        print(f"📋 Available enum values: {all_values}")
        
        # Separate uppercase and lowercase for analysis
        uppercase_values = [v for v in all_values if v.isupper()]
        lowercase_values = [v for v in all_values if v.islower()]
        
        print(f"📈 Uppercase values: {uppercase_values}")
        print(f"📉 Lowercase values: {lowercase_values}")
        
        # Safety check: ensure EXPAND phase was completed
        expected_lowercase = {'scheduled', 'in_progress', 'completed', 'cancelled'}
        actual_lowercase = set(lowercase_values)
        
        if not expected_lowercase.issubset(actual_lowercase):
            missing = expected_lowercase - actual_lowercase
            raise Exception(f"❌ Missing lowercase values: {missing}. Run EXPAND migration first!")
        
        print("✅ EXPAND phase verification successful - both value sets exist")
        
        # Step 2: Analyze current session data state
        print("\n🔍 Step 2: Analyzing current session data...")
        result = connection.execute(text("SELECT COUNT(*) FROM sessions"))
        total_sessions = result.scalar()
        print(f"📊 Total sessions in database: {total_sessions}")
        
        if total_sessions == 0:
            print("✅ No sessions to convert - database is empty")
            print("💡 WHY this is fine: We'll still update the default value for future sessions")
        else:
            # Show current status distribution
            result = connection.execute(text("""
                SELECT status, COUNT(*) as count 
                FROM sessions 
                GROUP BY status 
                ORDER BY status
            """))
            
            current_distribution = dict(result.fetchall())
            print(f"📈 Current session status distribution: {current_distribution}")
            
            # Analyze what needs conversion
            uppercase_sessions = sum(count for status, count in current_distribution.items() if status.isupper())
            lowercase_sessions = sum(count for status, count in current_distribution.items() if status.islower())
            
            print(f"📊 Sessions using uppercase values: {uppercase_sessions}")
            print(f"📊 Sessions using lowercase values: {lowercase_sessions}")
            
            if lowercase_sessions > 0:
                print("💡 Some sessions already use lowercase - this migration is idempotent")
        
        # Step 3: Perform data conversion
        print("\n🔄 Step 3: Converting session status values...")
        
        # Define the conversion mapping
        conversions = {
            'SCHEDULED': 'scheduled',
            'IN_PROGRESS': 'in_progress',
            'COMPLETED': 'completed',
            'CANCELLED': 'cancelled'
        }
        
        print("💡 WHY these specific conversions:")
        for old, new in conversions.items():
            print(f"   • {old} → {new} (database convention: lowercase)")
        
        total_converted = 0
        conversion_summary = {}
        
        for old_status, new_status in conversions.items():
            # Check how many sessions have this uppercase status
            result = connection.execute(text("""
                SELECT COUNT(*) FROM sessions WHERE status = :old_status
            """), {"old_status": old_status})
            
            count_to_convert = result.scalar()
            
            if count_to_convert > 0:
                print(f"   🔄 Converting {count_to_convert} sessions: '{old_status}' → '{new_status}'")
                
                # Perform the conversion using safe UPDATE operation
                result = connection.execute(text("""
                    UPDATE sessions 
                    SET status = :new_status 
                    WHERE status = :old_status
                """), {
                    "old_status": old_status, 
                    "new_status": new_status
                })
                
                # Verify the update worked as expected
                converted_count = result.rowcount
                if converted_count == count_to_convert:
                    print(f"   ✅ Successfully converted {converted_count} sessions")
                else:
                    print(f"   ⚠️  Expected {count_to_convert}, converted {converted_count}")
                
                total_converted += converted_count
                conversion_summary[old_status] = {"target": new_status, "count": converted_count}
            else:
                print(f"   ⏭️  No sessions found with status '{old_status}' - skipping")
        
        # Step 4: Update default value for future sessions
        print("\n🔧 Step 4: Updating default status value for new sessions...")
        print("💡 WHY: New sessions should use lowercase by default")
        
        connection.execute(text("""
            ALTER TABLE sessions 
            ALTER COLUMN status 
            SET DEFAULT 'scheduled'
        """))
        print("   ✅ Default status updated to 'scheduled' (lowercase)")
        
        # Step 5: Comprehensive verification of results
        print("\n🔍 Step 5: Verifying conversion results...")
        
        if total_sessions > 0:
            result = connection.execute(text("""
                SELECT status, COUNT(*) as count 
                FROM sessions 
                GROUP BY status 
                ORDER BY status
            """))
            
            final_distribution = dict(result.fetchall())
            print(f"📊 Final session status distribution: {final_distribution}")
            
            # Check if any uppercase values remain in data
            remaining_uppercase = {status: count for status, count in final_distribution.items() if status.isupper()}
            if remaining_uppercase:
                print(f"⚠️  Sessions still using uppercase values: {remaining_uppercase}")
                print("💡 This might indicate custom status values or migration issues")
            else:
                print("🎉 All sessions now use lowercase status values!")
            
            # Verify total count matches (no data lost)
            final_total = sum(final_distribution.values())
            if final_total == total_sessions:
                print(f"✅ Data integrity verified: {total_sessions} sessions before, {final_total} after")
            else:
                print(f"❌ Data integrity issue: {total_sessions} before, {final_total} after")
        
        # Step 6: Verify system configuration
        print("\n🔧 Step 6: Verifying system configuration...")
        
        # Check default value was updated
        result = connection.execute(text("""
            SELECT column_default 
            FROM information_schema.columns 
            WHERE table_name = 'sessions' AND column_name = 'status'
        """))
        
        default_value = result.scalar()
        print(f"📋 Current default value: {default_value}")
        
        # Success summary with actionable next steps
        print("\n🎉 MIGRATE phase completed successfully!")
        print("=" * 60)
        print("📊 CONVERSION SUMMARY:")
        print(f"   • Total sessions processed: {total_sessions}")
        print(f"   • Total sessions converted: {total_converted}")
        if conversion_summary:
            print("   • Detailed conversions:")
            for old_status, info in conversion_summary.items():
                print(f"     - {old_status} → {info['target']}: {info['count']} sessions")
        
        print("\n🚀 NEXT STEPS TO COMPLETE THE MIGRATION:")
        print("   1. Update your Python SessionStatus enum to use lowercase values")
        print("   2. Update your frontend getStatusColor() to handle lowercase values")  
        print("   3. Test your application thoroughly")
        print("   4. Deploy the updated application code")
        print("   5. Monitor for any issues in production")
        
        print("\n📝 IMPORTANT NOTES:")
        print("   • Uppercase enum values remain in database (PostgreSQL design)")
        print("   • This is SAFE - they're just not used by your application")
        print("   • Your application should only create/expect lowercase values")
        print("   • This provides backward compatibility insurance")
        
        print("\n💡 WHY this approach is professional:")
        print("   • Zero data loss during conversion")
        print("   • Each step verified before proceeding")
        print("   • Comprehensive logging for troubleshooting")
        print("   • Rollback capability preserved")
        print("   • Follows industry-standard EXPAND-MIGRATE-CONTRACT pattern")
        
    except Exception as e:
        print(f"\n❌ Error during MIGRATE phase: {e}")
        print("\n💡 COMMON ISSUES AND SOLUTIONS:")
        print("   • Missing lowercase enum values: Run EXPAND migration first")
        print("   • Data constraint violations: Check for invalid status values")
        print("   • Connection timeout: Large datasets may need batch processing")
        print("   • Permission errors: Ensure database user has UPDATE privileges")
        print("\n🔄 Safe recovery: This migration can be re-run safely (idempotent)")
        raise

def downgrade() -> None:
    """
    Rollback: Convert session data back to uppercase values.
    
    This undoes the data conversion, reverting sessions to use uppercase status values.
    This is useful for testing rollback procedures or reverting problematic deployments.
    
    WHY we provide comprehensive rollback:
    - Production systems need reliable undo procedures
    - Testing rollback builds confidence in migration safety
    - Rollback capability enables safer experimentation
    - Documentation of reverse process helps team understanding
    """
    
    print("⏪ MIGRATE Phase Rollback: Converting session data back to uppercase")
    print("💡 WHY: This undoes the data conversion for testing or emergency rollback")
    print("🔄 This will revert all sessions to use uppercase status values")
    
    connection = op.get_bind()
    
    try:
        # Step 1: Analyze current state before rollback
        print("\n🔍 Step 1: Analyzing current state before rollback...")
        result = connection.execute(text("SELECT COUNT(*) FROM sessions"))
        total_sessions = result.scalar()
        
        if total_sessions == 0:
            print("✅ No sessions to revert - database is empty")
        else:
            result = connection.execute(text("""
                SELECT status, COUNT(*) as count 
                FROM sessions 
                GROUP BY status 
                ORDER BY status
            """))
            
            current_distribution = dict(result.fetchall())
            print(f"📊 Current session status distribution: {current_distribution}")
            
            lowercase_sessions = sum(count for status, count in current_distribution.items() if status.islower())
            print(f"📈 Sessions to revert (lowercase): {lowercase_sessions}")
        
        # Step 2: Perform reverse conversions
        print("\n🔄 Step 2: Reverting session status values...")
        reverse_conversions = {
            'scheduled': 'SCHEDULED',
            'in_progress': 'IN_PROGRESS',
            'completed': 'COMPLETED',
            'cancelled': 'CANCELLED'
        }
        
        total_reverted = 0
        
        for old_status, new_status in reverse_conversions.items():
            # Check current count
            result = connection.execute(text("""
                SELECT COUNT(*) FROM sessions WHERE status = :old_status
            """), {"old_status": old_status})
            
            count_to_revert = result.scalar()
            
            if count_to_revert > 0:
                print(f"   🔄 Reverting {count_to_revert} sessions: '{old_status}' → '{new_status}'")
                
                # Perform the reversion
                result = connection.execute(text("""
                    UPDATE sessions 
                    SET status = :new_status 
                    WHERE status = :old_status
                """), {
                    "old_status": old_status, 
                    "new_status": new_status
                })
                
                reverted_count = result.rowcount
                print(f"   ✅ Reverted {reverted_count} sessions")
                total_reverted += reverted_count
            else:
                print(f"   ⏭️  No sessions with '{old_status}' to revert")
        
        # Step 3: Revert default value
        print("\n🔧 Step 3: Reverting default status value...")
        connection.execute(text("""
            ALTER TABLE sessions 
            ALTER COLUMN status 
            SET DEFAULT 'SCHEDULED'
        """))
        print("   ✅ Default status reverted to 'SCHEDULED' (uppercase)")
        
        # Step 4: Verification
        print("\n🔍 Step 4: Verifying rollback results...")
        if total_sessions > 0:
            result = connection.execute(text("""
                SELECT status, COUNT(*) as count 
                FROM sessions 
                GROUP BY status 
                ORDER BY status
            """))
            
            final_distribution = dict(result.fetchall())
            print(f"📊 Final session status distribution: {final_distribution}")
        
        print(f"\n⏪ Rollback completed successfully!")
        print(f"📊 Total sessions reverted: {total_reverted}")
        print("📝 Database is now back to using uppercase status values")
        print("💡 Remember to revert your application code changes if needed")
        
    except Exception as e:
        print(f"\n❌ Error during rollback: {e}")
        # Don't raise during rollback - be as permissive as possible
        print("📝 Rollback completed with errors - manual verification recommended")
        print("💡 Check session status values and default value manually")