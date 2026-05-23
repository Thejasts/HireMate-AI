-- AI Career Coach: Advanced DB Features
-- Triggers, Stored Procedures, Cursors, Transactions

USE ai_career_coach;

-- 1. TRIGGER: Log when interview response score is inserted

DELIMITER //
CREATE TRIGGER after_response_score_insert
AFTER INSERT ON Interview_Responses
FOR EACH ROW
BEGIN
    INSERT INTO Logs (action_type, description)
    VALUES ('SCORE_ADDED', CONCAT('Score ', NEW.score, '/10 recorded for question_id=', NEW.question_id, ' at ', NOW()));
END;
//
DELIMITER ;

-- 2. TRIGGER: Log when Interview_Scores is updated

DELIMITER //
CREATE TRIGGER after_interview_score_update
AFTER UPDATE ON Interview_Scores
FOR EACH ROW
BEGIN
    INSERT INTO Logs (action_type, description)
    VALUES ('SCORE_UPDATED', CONCAT('Session ', NEW.session_id, ' overall score updated from ', OLD.overall_score, ' to ', NEW.overall_score));
END;
//
DELIMITER ;

-- 3. TRIGGER: Log when interview session status changes to Completed

DELIMITER //
CREATE TRIGGER after_session_completed
AFTER UPDATE ON Interview_Sessions
FOR EACH ROW
BEGIN
    IF NEW.status = 'Completed' AND OLD.status != 'Completed' THEN
        INSERT INTO Logs (action_type, description)
        VALUES ('SESSION_COMPLETED', CONCAT('Interview session ', NEW.id, ' completed with final_score=', NEW.final_score));
    END IF;
END;
//
DELIMITER ;

-- 4. STORED PROCEDURE: Generate Interview Performance Report

DELIMITER //
CREATE PROCEDURE generate_performance_report(IN p_session_id INT)
BEGIN
    -- Return all Q&A with feedback
    SELECT 
        q.question_text,
        r.student_text_answer,
        r.ai_feedback_mistakes,
        r.ai_feedback_improvements,
        r.score
    FROM Interview_Questions q
    JOIN Interview_Responses r ON q.id = r.question_id
    WHERE q.session_id = p_session_id
    ORDER BY r.answered_at ASC;
END;
//
DELIMITER ;

-- 5. STORED PROCEDURE with CURSOR: Calculate Skill Gap
-- Iterates through Required_Skills for a job role,
-- compares with User_Skills, and returns missing skills.

DELIMITER //
CREATE PROCEDURE calculate_skill_gap(IN p_user_id INT, IN p_job_role_id INT)
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE v_req_skill VARCHAR(100);
    DECLARE v_importance VARCHAR(20);
    DECLARE v_has_skill INT;
    DECLARE v_total_required INT DEFAULT 0;
    DECLARE v_total_missing INT DEFAULT 0;
    
    -- Cursor to iterate over required skills
    DECLARE skill_cursor CURSOR FOR 
        SELECT skill_name, importance 
        FROM Required_Skills 
        WHERE job_role_id = p_job_role_id;
        
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    -- Temporary table for results
    DROP TEMPORARY TABLE IF EXISTS Temp_Skill_Gap;
    CREATE TEMPORARY TABLE Temp_Skill_Gap (
        skill_name VARCHAR(100),
        importance VARCHAR(20),
        status VARCHAR(20)
    );
    
    OPEN skill_cursor;
    
    read_loop: LOOP
        FETCH skill_cursor INTO v_req_skill, v_importance;
        
        IF done THEN
            LEAVE read_loop;
        END IF;
        
        SET v_total_required = v_total_required + 1;
        
        -- Check if user has this skill
        SELECT COUNT(*) INTO v_has_skill 
        FROM User_Skills 
        WHERE user_id = p_user_id AND LOWER(skill_name) = LOWER(v_req_skill);
        
        IF v_has_skill = 0 THEN
            INSERT INTO Temp_Skill_Gap (skill_name, importance, status) 
            VALUES (v_req_skill, v_importance, 'MISSING');
            SET v_total_missing = v_total_missing + 1;
        ELSE
            INSERT INTO Temp_Skill_Gap (skill_name, importance, status) 
            VALUES (v_req_skill, v_importance, 'PRESENT');
        END IF;
        
    END LOOP;
    
    CLOSE skill_cursor;
    
    -- Return missing skills
    SELECT skill_name, importance, status FROM Temp_Skill_Gap WHERE status = 'MISSING';
    
    -- Return gap percentage as second result set
    SELECT 
        v_total_required AS total_required,
        v_total_missing AS total_missing,
        ROUND((v_total_missing / v_total_required) * 100, 2) AS gap_percentage;
    
    DROP TEMPORARY TABLE IF EXISTS Temp_Skill_Gap;
END;
//
DELIMITER ;

-- 6. STORED PROCEDURE: Save Final Interview Score

DELIMITER //
CREATE PROCEDURE save_final_score(
    IN p_session_id INT,
    IN p_confidence DECIMAL(5,2),
    IN p_technical DECIMAL(5,2),
    IN p_communication DECIMAL(5,2),
    IN p_eye_contact DECIMAL(5,2),
    IN p_overall DECIMAL(5,2),
    IN p_weak_topics TEXT
)
BEGIN
    INSERT INTO Interview_Scores (session_id, confidence_score, technical_score, communication_score, eye_contact_score, overall_score, weak_topics)
    VALUES (p_session_id, p_confidence, p_technical, p_communication, p_eye_contact, p_overall, p_weak_topics);
    
    UPDATE Interview_Sessions 
    SET final_score = p_overall, status = 'Completed', end_time = NOW()
    WHERE id = p_session_id;
END;
//
DELIMITER ;
